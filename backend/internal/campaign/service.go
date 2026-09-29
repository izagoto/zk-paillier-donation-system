package campaign

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
)

var (
	ErrTitleRequired            = errors.New("title is required")
	ErrTargetAmountRequired     = errors.New("target amount is required")
	ErrMaxDonationRequired      = errors.New("max donation is required")
	ErrInvalidTargetAmount      = errors.New("invalid target amount")
	ErrInvalidMaxDonation       = errors.New("invalid max donation")
	ErrMaxDonationExceedsTarget = errors.New("max donation cannot exceed target amount")
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) Create(
	ctx context.Context,
	title string,
	description string,
	targetAmount string,
	maxDonation string,
	createdBy uuid.UUID,
) (*Campaign, error) {
	title = strings.TrimSpace(title)
	description = strings.TrimSpace(description)
	targetAmount = strings.TrimSpace(targetAmount)
	maxDonation = strings.TrimSpace(maxDonation)

	if title == "" {
		return nil, ErrTitleRequired
	}

	if targetAmount == "" {
		return nil, ErrTargetAmountRequired
	}

	if maxDonation == "" {
		return nil, ErrMaxDonationRequired
	}

	if !isValidAmount(targetAmount) {
		return nil, ErrInvalidTargetAmount
	}

	if !isValidAmount(maxDonation) {
		return nil, ErrInvalidMaxDonation
	}

	if compareAmount(maxDonation, targetAmount) > 0 {
		return nil, ErrMaxDonationExceedsTarget
	}

	return s.repository.Create(
		ctx,
		title,
		description,
		targetAmount,
		maxDonation,
		createdBy,
	)
}

func (s *Service) FindAll(
	ctx context.Context,
) ([]Campaign, error) {
	return s.repository.FindAll(ctx)
}

func (s *Service) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*Campaign, error) {
	return s.repository.FindByID(ctx, id)
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
