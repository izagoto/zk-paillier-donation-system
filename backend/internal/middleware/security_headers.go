package middleware

import "github.com/gin-gonic/gin"

// SecurityHeaders menambahkan header HTTP dasar untuk API + SPA.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		c.Next()
	}
}
