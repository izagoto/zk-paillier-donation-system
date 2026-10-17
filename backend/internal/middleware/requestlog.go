package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const requestIDHeader = "X-Request-Id"

// RequestLog mencatat method, path, status, durasi, dan request ID (untuk korelasi log).
func RequestLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		requestID := c.GetHeader(requestIDHeader)
		if requestID == "" {
			requestID = uuid.NewString()
		}
		c.Header(requestIDHeader, requestID)
		c.Set("request_id", requestID)

		c.Next()

		if c.Request.URL.Path == "/health" {
			return
		}

		log.Printf(
			"request_id=%s %s %s status=%d duration_ms=%d",
			requestID,
			c.Request.Method,
			c.Request.URL.Path,
			c.Writer.Status(),
			time.Since(start).Milliseconds(),
		)
	}
}
