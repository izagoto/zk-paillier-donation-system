package donation

import (
	"context"
	"errors"
	"math/big"
	"strings"

	"github.com/google/uuid"

	"github.com/izagoto/zk-paillier-donation-system/internal/campaign"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/commitment"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
)

var (
	ErrAmountRequired        = errors.New("amount is required")
	ErrInvalidAmount         = errors.New("invalid donation amount")
	ErrCampaignNotFound      = errors.New("campaign not found")
	ErrCampaignNotActive     = errors.New("campaign is not active")
	ErrAmountExceedsMaximum  = errors.New("donation amount exceeds campaign maximum")
	ErrInvalidDonationStatus = errors.New("invalid donation status")
)

type Service struct {
	repository         *Repository
	campaignRepository *campaign.Repository
	paillierPublicKey  *paillier.PublicKey
}

func NewService(
	repository *Repository,
	campaignRepository *campaign.Repository,
	paillierPublicKey *paillier.PublicKey,
) *Service {
	return &Service{
		repository:         repository,
		campaignRepository: campaignRepository,
		paillierPublicKey:  paillierPublicKey,
	}
}

func (s *Service) Create(
	ctx context.Context,
	campaignID uuid.UUID,
	donorID uuid.UUID,
	amount string,
) (*Donation, error) {
	amount = strings.TrimSpace(amount)

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

	message, ok := new(big.Int).SetString(amount, 10)
	if !ok {
		return nil, ErrInvalidAmount
	}

	secret, err := commitment.GenerateSecret()
	if err != nil {
		return nil, err
	}

	donationCommitment, err := commitment.Create(
		amount,
		secret,
	)
	if err != nil {
		return nil, err
	}

	if s.paillierPublicKey == nil {
		return nil, errors.New("paillier public key is not configured")
	}

	encryptedAmount, err := s.paillierPublicKey.Encrypt(message)
	if err != nil {
		return nil, err
	}

	donation, err := s.repository.Create(
		ctx,
		campaignID,
		donorID,
		donationCommitment,
		encryptedAmount.String(),
	)
	if err != nil {
		return nil, err
	}

	if err := s.Aggregate(ctx, campaignID); err != nil {
		return nil, err
	}

	return donation, nil
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

func (s *Service) Aggregate(
	ctx context.Context,
	campaignID uuid.UUID,
) error {
	donations, err := s.repository.FindConfirmedByCampaignID(
		ctx,
		campaignID,
	)
	if err != nil {
		return err
	}

	if len(donations) == 0 {
		return s.repository.UpsertAggregate(
			ctx,
			campaignID,
			"0",
		)
	}

	if s.paillierPublicKey == nil {
		return errors.New("paillier public key is not configured")
	}

	var encryptedTotal *big.Int

	for _, donation := range donations {
		ciphertext, ok := new(big.Int).SetString(
			donation.EncryptedAmount,
			10,
		)
		if !ok {
			return errors.New("invalid encrypted amount")
		}

		if encryptedTotal == nil {
			encryptedTotal = ciphertext
			continue
		}

		encryptedTotal, err = s.paillierPublicKey.Add(
			encryptedTotal,
			ciphertext,
		)
		if err != nil {
			return err
		}
	}

	return s.repository.UpsertAggregate(
		ctx,
		campaignID,
		encryptedTotal.String(),
	)
}

func (s *Service) Confirm(
	ctx context.Context,
	donationID uuid.UUID,
) error {
	donation, err := s.repository.FindByID(ctx, donationID)
	if err != nil {
		return err
	}

	if donation.Status != "pending" {
		return ErrInvalidDonationStatus
	}

	if err := s.repository.UpdateStatus(
		ctx,
		donationID,
		"confirmed",
	); err != nil {
		return err
	}

	return s.Aggregate(ctx, donation.CampaignID)
}
