package donation

import (
	"context"
	"log"
	"time"
)

// StartPendingReconcileLoop menjalankan rekonsiliasi pending secara berkala (RPC recovery ringan).
// interval <= 0: tidak dijalankan.
func StartPendingReconcileLoop(
	ctx context.Context,
	service *Service,
	interval time.Duration,
) {
	if service == nil || interval <= 0 {
		return
	}

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		log.Printf(
			"donation pending reconcile worker started (every %s)",
			interval,
		)

		for {
			select {
			case <-ctx.Done():
				log.Println("donation pending reconcile worker stopped")
				return
			case <-ticker.C:
				runPendingReconcile(ctx, service)
			}
		}
	}()
}

func runPendingReconcile(ctx context.Context, service *Service) {
	result, err := service.ReconcilePendingDonations(ctx, 25)
	if err != nil {
		log.Printf("pending reconcile error: %v", err)
		return
	}

	if result.Processed == 0 {
		return
	}

	log.Printf(
		"pending reconcile: processed=%d confirmed=%d failed=%d",
		result.Processed,
		result.Confirmed,
		result.Failed,
	)

	for _, msg := range result.Errors {
		log.Printf("pending reconcile detail: %s", msg)
	}
}
