package auth

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service    *Service
	jwtManager *JWTManager
}

func NewHandler(service *Service, jwtManager *JWTManager) *Handler {
	return &Handler{
		service:    service,
		jwtManager: jwtManager,
	}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Register(c *gin.Context) {
	var req registerRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	user, err := h.service.Register(
		c.Request.Context(),
		req.Email,
		req.Password,
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailRequired),
			errors.Is(err, ErrPasswordRequired):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case errors.Is(err, ErrEmailExists):
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})

		default:
			log.Printf("register error: %v", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal server error",
			})
		}

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req loginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	user, err := h.service.Login(
		c.Request.Context(),
		req.Email,
		req.Password,
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailRequired),
			errors.Is(err, ErrPasswordRequired):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case errors.Is(err, ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})

		default:
			log.Printf("login error: %v", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal server error",
			})
		}

		return
	}

	token, err := h.jwtManager.GenerateToken(user)
	if err != nil {
		log.Printf("token generation error: %v", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": token,
	})
}

func (h *Handler) Me(c *gin.Context) {
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

	user, err := h.service.GetUserByID(
		c.Request.Context(),
		userID,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}
