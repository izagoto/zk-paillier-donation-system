package auth

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestLoginRateLimiterBlocksAfterMaxFailures(t *testing.T) {
	gin.SetMode(gin.TestMode)
	limiter := NewLoginRateLimiter(3, time.Minute)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("POST", "/login", nil)
	c.Request.RemoteAddr = "203.0.113.10:1234"

	for i := 0; i < 3; i++ {
		if !limiter.Allow(c) {
			t.Fatalf("expected allow on attempt %d", i+1)
		}
		limiter.RecordFailure(c)
	}

	if limiter.Allow(c) {
		t.Fatal("expected block after max failures")
	}

	limiter.RecordSuccess(c)
	if !limiter.Allow(c) {
		t.Fatal("expected allow after success reset")
	}
}
