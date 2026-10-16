package campaign

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/izagoto/zk-paillier-donation-system/internal/auth"
	"github.com/izagoto/zk-paillier-donation-system/internal/blockchain"
)

var (
	ErrTitleRequired            = errors.New("title is required")
	ErrTargetAmountRequired     = errors.New("target amount is required")
	ErrMaxDonationRequired      = errors.New("max donation is required")
	ErrInvalidTargetAmount      = errors.New("invalid target amount")
	ErrInvalidMaxDonation       = errors.New("invalid max donation")
	ErrMaxDonationExceedsTarget = errors.New("max donation cannot exceed target amount")
	ErrCampaignNotFound         = errors.New("campaign not found")
	ErrForbidden                = errors.New("forbidden")
	ErrInvalidStatus            = errors.New("invalid campaign status")
)

type Service struct {
	repository         *Repository
	blockchainRegistry *blockchain.Registry
	blockchainSigner   *blockchain.Signer
}

func NewService(
	repository *Repository,
	blockchainRegistry *blockchain.Registry,
	blockchainSigner *blockchain.Signer,
) *Service {
	return &Service{
		repository:         repository,
		blockchainRegistry: blockchainRegistry,
		blockchainSigner:   blockchainSigner,
	}
}

func (s *Service) Create(
	ctx context.Context,
	title string,
	description string,
	targetAmount string,
	maxDonation string,
	imageURL string,
	category string,
	location string,
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

	campaignID := uuid.New()

	_, err := s.blockchainRegistry.SetCampaignMaxDonation(
		ctx,
		s.blockchainSigner,
		campaignID.String(),
		maxDonation,
	)
	if err != nil {
		return nil, err
	}

	return s.repository.Create(
		ctx,
		campaignID,
		title,
		description,
		targetAmount,
		maxDonation,
		imageURL,
		category,
		location,
		createdBy,
	)
}

type UpdateInput struct {
	Title       string
	Description string
	Status      string
	ImageURL    string
	Category    string
	Location    string
}

func (s *Service) Update(
	ctx context.Context,
	campaignID uuid.UUID,
	actorID uuid.UUID,
	actorRole string,
	input UpdateInput,
) (*Campaign, error) {
	existing, err := s.repository.FindByID(ctx, campaignID)
	if err != nil {
		return nil, ErrCampaignNotFound
	}

	if actorRole != auth.RoleAdmin && existing.CreatedBy != actorID {
		return nil, ErrForbidden
	}

	title := strings.TrimSpace(input.Title)
	if title == "" {
		return nil, ErrTitleRequired
	}

	description := strings.TrimSpace(input.Description)
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = existing.Status
	}

	if status != "active" && status != "closed" {
		return nil, ErrInvalidStatus
	}

	return s.repository.Update(
		ctx,
		campaignID,
		title,
		description,
		status,
		strings.TrimSpace(input.ImageURL),
		strings.TrimSpace(input.Category),
		strings.TrimSpace(input.Location),
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
