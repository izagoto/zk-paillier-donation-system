package auth

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service        *Service
	jwtManager     *JWTManager
	bootstrapToken string
	loginLimiter   *LoginRateLimiter
}

func NewHandler(
	service *Service,
	jwtManager *JWTManager,
	bootstrapToken string,
	loginLimiter *LoginRateLimiter,
) *Handler {
	return &Handler{
		service:        service,
		jwtManager:     jwtManager,
		bootstrapToken: bootstrapToken,
		loginLimiter:   loginLimiter,
	}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
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

	count, err := h.service.CountUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return
	}

	if count == 0 && req.Role == "" {
		req.Role = RoleAdmin
	}

	if !h.canRegisterUser(c, count) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": ErrForbidden.Error(),
		})
		return
	}

	user, err := h.service.Register(
		c.Request.Context(),
		req.Email,
		req.Password,
		req.Role,
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailRequired),
			errors.Is(err, ErrPasswordRequired):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case errors.Is(err, ErrInvalidRole):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

		case errors.Is(err, ErrEmailExists):
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})

		case errors.Is(err, ErrPasswordTooShort),
			errors.Is(err, ErrPasswordTooLong):
			c.JSON(http.StatusBadRequest, gin.H{
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
			if h.loginLimiter != nil {
				h.loginLimiter.RecordFailure(c)
			}
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

	if h.loginLimiter != nil {
		h.loginLimiter.RecordSuccess(c)
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

func (h *Handler) canRegisterUser(c *gin.Context, userCount int64) bool {
	if roleValue, ok := c.Get("user_role"); ok {
		if role, ok := roleValue.(string); ok && CanManageUsers(role) {
			return true
		}
	}

	if h.bootstrapToken != "" &&
		c.GetHeader("X-Bootstrap-Token") == h.bootstrapToken {
		return true
	}

	return userCount == 0
}
