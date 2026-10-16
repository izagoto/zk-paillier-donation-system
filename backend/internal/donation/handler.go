package donation

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/izagoto/zk-paillier-donation-system/internal/zk"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

type createDonationRequest struct {
	CampaignID string   `json:"campaign_id"`
	Amount     string   `json:"amount"`
	Commitment string   `json:"commitment"`
	Proof      zk.Proof `json:"proof"`
}

type generateProofRequest struct {
	CampaignID string `json:"campaign_id"`
	Amount     string `json:"amount"`
}

type donationResponse struct {
	ID              uuid.UUID `json:"id"`
	CampaignID      uuid.UUID `json:"campaign_id"`
	Commitment      string    `json:"commitment"`
	EncryptedAmount string    `json:"encrypted_amount"`
	TxHash          string    `json:"tx_hash"`
	Status          string    `json:"status"`
	CreatedAt       string    `json:"created_at"`
}

func toDonationResponse(donation *Donation) donationResponse {
	return donationResponse{
		ID:              donation.ID,
		CampaignID:      donation.CampaignID,
		Commitment:      donation.Commitment,
		EncryptedAmount: donation.EncryptedAmount,
		TxHash:          donation.TxHash,
		Status:          donation.Status,
		CreatedAt:       donation.CreatedAt.Format(time.RFC3339),
	}
}

func (h *Handler) Create(c *gin.Context) {
	var request createDonationRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	campaignID, err := uuid.Parse(request.CampaignID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid campaign_id",
		})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user identity",
		})
		return
	}

	idempotencyKey := c.GetHeader("Idempotency-Key")
	if idempotencyKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": ErrIdempotencyKeyRequired.Error(),
		})
		return
	}

	donation, err := h.service.Create(
		c.Request.Context(),
		campaignID,
		userID,
		request.Amount,
		request.Commitment,
		request.Proof,
		idempotencyKey,
	)
	if err != nil {
		switch err {
		case ErrAmountRequired:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrInvalidAmount:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrCampaignNotFound:
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

		case ErrCampaignNotActive:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrAmountExceedsMaximum:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrCommitmentRequired:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrInvalidZKProof:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case ErrIdempotencyKeyRequired:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to create donation",
			})
		}

		return
	}

	c.JSON(http.StatusCreated, toDonationResponse(donation))
}

func (h *Handler) GenerateProof(c *gin.Context) {
	var request generateProofRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	campaignID, err := uuid.Parse(request.CampaignID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid campaign_id",
		})
		return
	}

	result, err := h.service.GenerateProof(
		c.Request.Context(),
		campaignID,
		request.Amount,
	)
	if err != nil {
		switch err {
		case ErrAmountRequired, ErrInvalidAmount, ErrCampaignNotActive, ErrAmountExceedsMaximum:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		case ErrCampaignNotFound:
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
		}

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"amount":       result.Amount,
		"commitment":   result.Commitment,
		"campaign_max": result.CampaignMax,
		"proof":        result.Proof,
	})
}

func (h *Handler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid donation id",
		})
		return
	}

	donation, err := h.service.FindByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "donation not found",
		})
		return
	}

	c.JSON(http.StatusOK, toDonationResponse(donation))
}

func (h *Handler) FindByCampaignID(c *gin.Context) {
	campaignID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid campaign_id",
		})
		return
	}

	donations, err := h.service.FindByCampaignID(
		c.Request.Context(),
		campaignID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to load donations",
		})
		return
	}

	responses := make([]donationResponse, 0, len(donations))
	for i := range donations {
		responses = append(responses, toDonationResponse(&donations[i]))
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
	})
}

func (h *Handler) GetCampaignAggregate(c *gin.Context) {
	campaignID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid campaign_id",
		})
		return
	}

	summary, err := h.service.GetAggregateSummary(
		c.Request.Context(),
		campaignID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to load aggregate",
		})
		return
	}

	response := gin.H{
		"encrypted_total":  summary.EncryptedTotal,
		"donation_count":   summary.DonationCount,
	}

	if summary.HasDecryptedTotal {
		response["decrypted_total"] = summary.DecryptedTotal
	}

	c.JSON(http.StatusOK, response)
}
