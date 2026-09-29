package donation

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/izagoto/zk-paillier-donation-system/internal/campaign"
)

var (
	ErrAmountRequired       = errors.New("amount is required")
	ErrInvalidAmount        = errors.New("invalid donation amount")
	ErrCampaignNotFound     = errors.New("campaign not found")
	ErrCampaignNotActive    = errors.New("campaign is not active")
	ErrAmountExceedsMaximum = errors.New("donation amount exceeds campaign maximum")
)

type Service struct {
	repository         *Repository
	campaignRepository *campaign.Repository
}

func NewService(
	repository *Repository,
	campaignRepository *campaign.Repository,
) *Service {
	return &Service{
		repository:         repository,
		campaignRepository: campaignRepository,
	}
}

func (s *Service) Create(
	ctx context.Context,
	campaignID uuid.UUID,
	donorID uuid.UUID,
	amount string,
	commitment string,
	encryptedAmount string,
) (*Donation, error) {
	amount = strings.TrimSpace(amount)
	commitment = strings.TrimSpace(commitment)
	encryptedAmount = strings.TrimSpace(encryptedAmount)

	if amount == "" {
		return nil, ErrAmountRequired
	}

	if !isValidAmount(amount) {
		return nil, ErrInvalidAmount
	}

	campaignData, err := s.campaignRepository.FindByID(
		ctx,
		campaignID,
	)
	if err != nil {
		return nil, ErrCampaignNotFound
	}

	if campaignData.Status != "active" {
		return nil, ErrCampaignNotActive
	}

	if compareAmount(amount, campaignData.MaxDonation) > 0 {
		return nil, ErrAmountExceedsMaximum
	}

	return s.repository.Create(
		ctx,
		campaignID,
		donorID,
		commitment,
		encryptedAmount,
	)
}

func (s *Service) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*Donation, error) {
	return s.repository.FindByID(ctx, id)
}

func (s *Service) FindByCampaignID(
	ctx context.Context,
	campaignID uuid.UUID,
) ([]Donation, error) {
	return s.repository.FindByCampaignID(ctx, campaignID)
}

func isValidAmount(value string) bool {
	if value == "" {
		return false
	}

	for _, char := range value {
		if char < '0' || char > '9' {
			return false
		}
	}

	return value != "0"
}

func compareAmount(a, b string) int {
	a = strings.TrimLeft(a, "0")
	b = strings.TrimLeft(b, "0")

	if a == "" {
		a = "0"
	}

	if b == "" {
		b = "0"
	}

	if len(a) > len(b) {
		return 1
	}

	if len(a) < len(b) {
		return -1
	}

	if a > b {
		return 1
	}

	if a < b {
		return -1
	}

	return 0
}
