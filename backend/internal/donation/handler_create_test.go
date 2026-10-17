package donation

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func TestHandlerCreate_MissingIdempotencyKey(t *testing.T) {
	gin.SetMode(gin.TestMode)

	campaignID := uuid.New()
	body := strings.NewReader(
		`{"campaign_id":"` + campaignID.String() +
			`","amount":"1000","commitment":"123","proof":{}}`,
	)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/donations", body)
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("user_id", uuid.New())

	h := NewHandler(nil)
	h.Create(c)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d body=%s", w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "idempotency") {
		t.Fatalf("expected idempotency error, got %s", w.Body.String())
	}
}
