package donation

import (
	"context"
	"encoding/json"
	"errors"
	"math/big"
	"strings"

	"github.com/google/uuid"

	"github.com/izagoto/zk-paillier-donation-system/internal/blockchain"
	"github.com/izagoto/zk-paillier-donation-system/internal/campaign"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/zk"
)

var (
	ErrAmountRequired        = errors.New("amount is required")
	ErrInvalidAmount         = errors.New("invalid donation amount")
	ErrCampaignNotFound      = errors.New("campaign not found")
	ErrCampaignNotActive     = errors.New("campaign is not active")
	ErrAmountExceedsMaximum  = errors.New("donation amount exceeds campaign maximum")
	ErrCommitmentRequired    = errors.New("commitment is required")
	ErrInvalidDonationStatus = errors.New("invalid donation status")
	ErrInvalidZKProof        = errors.New("invalid zk proof")
)

type Service struct {
	repository         *Repository
	campaignRepository *campaign.Repository
	paillierPublicKey  *paillier.PublicKey
	zkVerifier         *zk.Verifier
	blockchainRegistry *blockchain.Registry
	blockchainSigner   *blockchain.Signer
}

func NewService(
	repository *Repository,
	campaignRepository *campaign.Repository,
	paillierPublicKey *paillier.PublicKey,
	zkVerifier *zk.Verifier,
	blockchainRegistry *blockchain.Registry,
	blockchainSigner *blockchain.Signer,
) *Service {
	return &Service{
		repository:         repository,
		campaignRepository: campaignRepository,
		paillierPublicKey:  paillierPublicKey,
		zkVerifier:         zkVerifier,
		blockchainRegistry: blockchainRegistry,
		blockchainSigner:   blockchainSigner,
	}
}

func (s *Service) Create(
	ctx context.Context,
	campaignID uuid.UUID,
	donorID uuid.UUID,
	amount string,
	providedCommitment string,
	proof zk.Proof,
) (*Donation, error) {
	amount = strings.TrimSpace(amount)
	providedCommitment = strings.TrimSpace(providedCommitment)

	if amount == "" {
		return nil, ErrAmountRequired
	}

	if !isValidAmount(amount) {
		return nil, ErrInvalidAmount
	}

	if providedCommitment == "" {
		return nil, ErrCommitmentRequired
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

	// Verify the ZK proof using trusted campaign data.
	// campaign_max is taken from the database, not from the client.
	if s.zkVerifier == nil {
		return nil, errors.New("zk verifier is not configured")
	}

	publicInputs := zk.PublicInputs{
		CampaignMax: campaignData.MaxDonation,
		Commitment:  providedCommitment,
	}

	if err := s.zkVerifier.VerifyProof(
		ctx,
		proof,
		publicInputs,
	); err != nil {
		return nil, ErrInvalidZKProof
	}

	message, ok := new(big.Int).SetString(amount, 10)
	if !ok {
		return nil, ErrInvalidAmount
	}

	if s.paillierPublicKey == nil {
		return nil, errors.New("paillier public key is not configured")
	}

	encryptedAmount, err := s.paillierPublicKey.Encrypt(message)
	if err != nil {
		return nil, err
	}

	proofJSON, err := json.Marshal(proof)
	if err != nil {
		return nil, err
	}

	// Store the donation first as pending.
	donation, err := s.repository.Create(
		ctx,
		campaignID,
		donorID,
		providedCommitment,
		encryptedAmount.String(),
		string(proofJSON),
	)
	if err != nil {
		return nil, err
	}

	if s.blockchainRegistry == nil {
		return nil, errors.New("blockchain registry is not configured")
	}

	if s.blockchainSigner == nil {
		return nil, errors.New("blockchain signer is not configured")
	}

	// Prepare the blockchain payload using the same
	// ciphertext and ZK proof stored in the database.
	payload := blockchain.NewDonationPayload(
		campaignID.String(),
		providedCommitment,
		encryptedAmount.String(),
		string(proofJSON),
	)

	// Record the donation on-chain and wait until
	// the transaction is mined successfully.
	txHash, err := s.blockchainRegistry.RecordDonation(
		ctx,
		s.blockchainSigner,
		payload,
	)
	if err != nil {
		return nil, err
	}

	// Store the confirmed blockchain transaction hash.
	if err := s.repository.UpdateTxHash(
		ctx,
		donation.ID,
		txHash,
	); err != nil {
		return nil, err
	}

	// The blockchain transaction has already been mined
	// successfully, so the donation can be marked confirmed.
	if err := s.repository.UpdateStatus(
		ctx,
		donation.ID,
		"confirmed",
	); err != nil {
		return nil, err
	}

	// Aggregate only confirmed donations.
	if err := s.Aggregate(ctx, campaignID); err != nil {
		return nil, err
	}

	// Reflect the final state in the returned object.
	donation.TxHash = txHash
	donation.Status = "confirmed"

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
