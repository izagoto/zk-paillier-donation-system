package donation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	CampaignID string `json:"campaign_id"`
	Amount     string `json:"amount"`
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

	donation, err := h.service.Create(
		c.Request.Context(),
		campaignID,
		userID,
		request.Amount,
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

		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to create donation",
			})
		}

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":               donation.ID,
		"campaign_id":      donation.CampaignID,
		"commitment":       donation.Commitment,
		"encrypted_amount": donation.EncryptedAmount,
		"status":           donation.Status,
		"created_at":       donation.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *Handler) Confirm(c *gin.Context) {
	donationID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid donation id",
		})
		return
	}

	if err := h.service.Confirm(
		c.Request.Context(),
		donationID,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to confirm donation",
		})
		return
	}

	donation, err := h.service.FindByID(
		c.Request.Context(),
		donationID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get donation",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          donation.ID,
		"status":      donation.Status,
		"campaign_id": donation.CampaignID,
	})
}
