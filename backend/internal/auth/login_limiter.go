package auth

import (
	"errors"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var ErrTooManyLoginAttempts = errors.New("too many login attempts")

// LoginRateLimiter limits failed login attempts per client IP (in-memory; satu proses).
type LoginRateLimiter struct {
	mu          sync.Mutex
	attempts    map[string]int
	windowStart map[string]time.Time
	maxAttempts int
	window      time.Duration
}

func NewLoginRateLimiter(maxAttempts int, window time.Duration) *LoginRateLimiter {
	if maxAttempts < 1 {
		maxAttempts = 10
	}
	if window < time.Minute {
		window = 15 * time.Minute
	}

	return &LoginRateLimiter{
		attempts:    make(map[string]int),
		windowStart: make(map[string]time.Time),
		maxAttempts: maxAttempts,
		window:      window,
	}
}

func (l *LoginRateLimiter) clientKey(c *gin.Context) string {
	return c.ClientIP()
}

func (l *LoginRateLimiter) resetIfExpired(key string, now time.Time) {
	start := l.windowStart[key]
	if start.IsZero() || now.Sub(start) >= l.window {
		l.attempts[key] = 0
		l.windowStart[key] = now
	}
}

func (l *LoginRateLimiter) Allow(c *gin.Context) bool {
	key := l.clientKey(c)
	now := time.Now()

	l.mu.Lock()
	defer l.mu.Unlock()

	l.resetIfExpired(key, now)
	return l.attempts[key] < l.maxAttempts
}

func (l *LoginRateLimiter) RecordFailure(c *gin.Context) {
	key := l.clientKey(c)
	now := time.Now()

	l.mu.Lock()
	defer l.mu.Unlock()

	l.resetIfExpired(key, now)
	l.attempts[key]++
}

func (l *LoginRateLimiter) RecordSuccess(c *gin.Context) {
	key := l.clientKey(c)

	l.mu.Lock()
	defer l.mu.Unlock()

	delete(l.attempts, key)
	delete(l.windowStart, key)
}

func (l *LoginRateLimiter) RetryAfterSeconds(c *gin.Context) int {
	key := l.clientKey(c)
	now := time.Now()

	l.mu.Lock()
	defer l.mu.Unlock()

	start := l.windowStart[key]
	if start.IsZero() {
		return int(l.window.Seconds())
	}

	remaining := l.window - now.Sub(start)
	if remaining < 0 {
		return 0
	}

	return int(remaining.Seconds()) + 1
}

func LoginRateLimitMiddleware(limiter *LoginRateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		if limiter == nil || !limiter.Allow(c) {
			retry := 60
			if limiter != nil {
				retry = limiter.RetryAfterSeconds(c)
				if retry < 1 {
					retry = 60
				}
			}

			c.Header("Retry-After", strconv.Itoa(retry))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "too many login attempts",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
