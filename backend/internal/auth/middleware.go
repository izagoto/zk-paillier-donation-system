package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(jwtManager *JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := parseBearerClaims(c, jwtManager)
		if !ok {
			return
		}

		userID, err := ParseUserID(claims)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid user identity",
			})
			c.Abort()
			return
		}

		role, err := ParseRole(claims)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid role in token",
			})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("user_role", role)

		c.Next()
	}
}

// OptionalAuthMiddleware parses JWT when present; does not require authentication.
func OptionalAuthMiddleware(jwtManager *JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := tryParseBearerClaims(c, jwtManager)
		if !ok {
			c.Next()
			return
		}

		userID, err := ParseUserID(claims)
		if err == nil {
			c.Set("user_id", userID)
		}

		role, err := ParseRole(claims)
		if err == nil {
			c.Set("user_role", role)
		}

		c.Next()
	}
}

func tryParseBearerClaims(
	c *gin.Context,
	jwtManager *JWTManager,
) (jwt.MapClaims, bool) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return nil, false
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return nil, false
	}

	token, err := jwt.Parse(
		parts[1],
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, jwt.ErrSignatureInvalid
			}

			return []byte(jwtManager.secret), nil
		},
	)
	if err != nil || !token.Valid {
		return nil, false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, false
	}

	return claims, true
}

func RequireRole(allowed ...string) gin.HandlerFunc {
	allowedSet := make(map[string]struct{}, len(allowed))
	for _, role := range allowed {
		allowedSet[role] = struct{}{}
	}

	return func(c *gin.Context) {
		value, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "forbidden",
			})
			c.Abort()
			return
		}

		role, ok := value.(string)
		if !ok || role == "" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "forbidden",
			})
			c.Abort()
			return
		}

		if _, ok := allowedSet[role]; !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "forbidden",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func parseBearerClaims(
	c *gin.Context,
	jwtManager *JWTManager,
) (jwt.MapClaims, bool) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "authorization header is required",
		})
		c.Abort()
		return nil, false
	}

	parts := strings.SplitN(authHeader, " ", 2)

	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid authorization header",
		})
		c.Abort()
		return nil, false
	}

	tokenString := parts[1]

	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, jwt.ErrSignatureInvalid
			}

			return []byte(jwtManager.secret), nil
		},
	)
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid or expired token",
		})
		c.Abort()
		return nil, false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid token claims",
		})
		c.Abort()
		return nil, false
	}

	return claims, true
}
