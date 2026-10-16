package donation

import "testing"

func TestCanTransitionStatus(t *testing.T) {
	if !CanTransitionStatus("pending", "confirmed") {
		t.Fatal("pending -> confirmed should be allowed")
	}
	if !CanTransitionStatus("pending", "failed") {
		t.Fatal("pending -> failed should be allowed")
	}
	if CanTransitionStatus("confirmed", "pending") {
		t.Fatal("confirmed -> pending should be denied")
	}
	if CanTransitionStatus("failed", "confirmed") {
		t.Fatal("failed -> confirmed should be denied")
	}
	if !CanTransitionStatus("failed", "pending") {
		t.Fatal("failed -> pending should be allowed for retry")
	}
	if !CanTransitionStatus("pending", "pending") {
		t.Fatal("same status should be allowed")
	}
}
