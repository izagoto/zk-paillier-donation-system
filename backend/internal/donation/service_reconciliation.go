package donation

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

type ReconciliationOverview struct {
	LiveDonations      int `json:"live_donations"`
	ArchiveRows        int `json:"archive_rows"`
	PendingDonations   int `json:"pending_donations"`
	ConfirmedDonations int `json:"confirmed_donations"`
	FailedDonations    int `json:"failed_donations"`
}

type AggregateReconcileResult struct {
	CampaignID        uuid.UUID `json:"campaign_id"`
	EncryptedBefore   string    `json:"encrypted_before"`
	EncryptedAfter    string    `json:"encrypted_after"`
	RecomputedChanged bool      `json:"recomputed_changed"`
}

func (s *Service) GetReconciliationOverview(
	ctx context.Context,
) (*ReconciliationOverview, error) {
	counts, err := s.repository.CountDonationsByStatus(ctx)
	if err != nil {
		return nil, err
	}

	archiveCount, err := s.repository.CountArchiveRows(ctx)
	if err != nil {
		return nil, err
	}

	total := counts.Pending + counts.Confirmed + counts.Failed

	return &ReconciliationOverview{
		LiveDonations:      total,
		ArchiveRows:        archiveCount,
		PendingDonations:   counts.Pending,
		ConfirmedDonations: counts.Confirmed,
		FailedDonations:    counts.Failed,
	}, nil
}

func (s *Service) ListArchiveRows(
	ctx context.Context,
	limit int,
) ([]ArchiveRow, error) {
	return s.repository.ListArchiveRows(ctx, limit)
}

func (s *Service) ReconcileCampaignAggregate(
	ctx context.Context,
	campaignID uuid.UUID,
) (*AggregateReconcileResult, error) {
	before, err := s.repository.FindAggregate(ctx, campaignID)
	if err != nil {
		before = "0"
	}

	if err := s.Aggregate(ctx, campaignID); err != nil {
		return nil, err
	}

	after, err := s.repository.FindAggregate(ctx, campaignID)
	if err != nil {
		after = "0"
	}

	return &AggregateReconcileResult{
		CampaignID:        campaignID,
		EncryptedBefore:   before,
		EncryptedAfter:    after,
		RecomputedChanged: before != after,
	}, nil
}

type PendingReconcileResult struct {
	Processed int      `json:"processed"`
	Confirmed int      `json:"confirmed"`
	Failed    int      `json:"failed"`
	Errors    []string `json:"errors,omitempty"`
}

func (s *Service) ReconcilePendingDonations(
	ctx context.Context,
	limit int,
) (*PendingReconcileResult, error) {
	pending, err := s.repository.FindPending(ctx, limit)
	if err != nil {
		return nil, err
	}

	result := &PendingReconcileResult{}

	for _, item := range pending {
		result.Processed++
		donation := item

		campaignData, err := s.campaignRepository.FindByID(ctx, donation.CampaignID)
		if err != nil {
			result.Failed++
			result.Errors = append(
				result.Errors,
				donation.ID.String()+": campaign not found",
			)
			continue
		}

		var reconcileErr error
		if donation.TxHash != "" {
			reconcileErr = s.completePendingAfterChain(ctx, &donation)
		} else {
			reconcileErr = s.finalizeOnChain(ctx, &donation, campaignData.MaxDonation)
		}

		if reconcileErr != nil {
			result.Failed++
			result.Errors = append(
				result.Errors,
				donation.ID.String()+": "+reconcileErr.Error(),
			)
			continue
		}

		result.Confirmed++
	}

	return result, nil
}

func (s *Service) completePendingAfterChain(
	ctx context.Context,
	donation *Donation,
) error {
	if donation.TxHash == "" {
		return errors.New("missing tx hash")
	}

	if err := s.repository.TransitionStatus(
		ctx,
		donation.ID,
		"pending",
		"confirmed",
	); err != nil {
		return err
	}

	if err := s.IncrementAggregate(
		ctx,
		donation.CampaignID,
		donation.EncryptedAmount,
	); err != nil {
		return err
	}

	donation.Status = "confirmed"
	return nil
}
