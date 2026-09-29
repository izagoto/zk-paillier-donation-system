package campaign

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

type createCampaignRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	TargetAmount string `json:"target_amount"`
	MaxDonation  string `json:"max_donation"`
}

type campaignResponse struct {
	ID           uuid.UUID `json:"id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	TargetAmount string    `json:"target_amount"`
	MaxDonation  string    `json:"max_donation"`
	Status       string    `json:"status"`
	CreatedBy    uuid.UUID `json:"created_by"`
	CreatedAt    string    `json:"created_at"`
}

func toCampaignResponse(campaign *Campaign) campaignResponse {
	return campaignResponse{
		ID:           campaign.ID,
		Title:        campaign.Title,
		Description:  campaign.Description,
		TargetAmount: campaign.TargetAmount,
		MaxDonation:  campaign.MaxDonation,
		Status:       campaign.Status,
		CreatedBy:    campaign.CreatedBy,
		CreatedAt:    campaign.CreatedAt.Format(time.RFC3339),
	}
}

func (h *Handler) Create(c *gin.Context) {
	var req createCampaignRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	value, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user identity not found",
		})
		return
	}

	userID, ok := value.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user identity",
		})
		return
	}

	campaign, err := h.service.Create(
		c.Request.Context(),
		req.Title,
		req.Description,
		req.TargetAmount,
		req.MaxDonation,
		userID,
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrTitleRequired),
			errors.Is(err, ErrTargetAmountRequired),
			errors.Is(err, ErrMaxDonationRequired),
			errors.Is(err, ErrInvalidTargetAmount),
			errors.Is(err, ErrInvalidMaxDonation),
			errors.Is(err, ErrMaxDonationExceedsTarget):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal server error",
			})
		}

		return
	}

	c.JSON(http.StatusCreated, toCampaignResponse(campaign))
}

func (h *Handler) FindAll(c *gin.Context) {
	campaigns, err := h.service.FindAll(
		c.Request.Context(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return
	}

	responses := make([]campaignResponse, 0, len(campaigns))

	for i := range campaigns {
		responses = append(
			responses,
			toCampaignResponse(&campaigns[i]),
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
	})
}

func (h *Handler) FindByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid campaign id",
		})
		return
	}

	campaign, err := h.service.FindByID(
		c.Request.Context(),
		id,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "campaign not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, toCampaignResponse(campaign))
}
