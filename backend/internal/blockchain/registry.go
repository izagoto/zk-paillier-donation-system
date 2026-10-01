package blockchain

import (
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

type Registry struct {
	Client   *Client
	Contract *Contract
	Address  common.Address
}

func NewRegistry(
	client *Client,
	contract *Contract,
) (*Registry, error) {
	if client == nil {
		return nil, fmt.Errorf("blockchain client is required")
	}

	if contract == nil {
		return nil, fmt.Errorf("contract is required")
	}

	if !common.IsHexAddress(contract.Address) {
		return nil, fmt.Errorf("invalid contract address")
	}

	return &Registry{
		Client:   client,
		Contract: contract,
		Address:  common.HexToAddress(contract.Address),
	}, nil
}

func (r *Registry) PackRecordDonation(
	campaignID [32]byte,
	commitment [32]byte,
	encryptedAmount []byte,
	zkProof []byte,
) ([]byte, error) {
	data, err := r.Contract.ABI.Pack(
		"recordDonation",
		campaignID,
		commitment,
		encryptedAmount,
		zkProof,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to pack recordDonation call: %w", err)
	}

	return data, nil
}

func (r *Registry) RecordDonation(
	ctx context.Context,
	signer *Signer,
	payload DonationPayload,
) (string, error) {
	if signer == nil {
		return "", fmt.Errorf("signer is required")
	}

	if payload.CampaignID == "" {
		return "", fmt.Errorf("campaign ID is required")
	}

	if payload.Commitment == "" {
		return "", fmt.Errorf("commitment is required")
	}

	campaignID := crypto.Keccak256Hash(
		[]byte(payload.CampaignID),
	)

	commitmentInt, ok := new(big.Int).SetString(
		payload.Commitment,
		10,
	)
	if !ok {
		return "", fmt.Errorf("invalid commitment")
	}

	if commitmentInt.Sign() < 0 {
		return "", fmt.Errorf("commitment must not be negative")
	}

	commitmentBytes := common.BytesToHash(
		commitmentInt.Bytes(),
	)

	data, err := r.PackRecordDonation(
		campaignID,
		commitmentBytes,
		[]byte(payload.EncryptedAmount),
		[]byte(payload.ZKProof),
	)
	if err != nil {
		return "", err
	}

	tx, err := BuildSignedTransaction(
		ctx,
		r.Client,
		signer,
		r.Address,
		data,
		big.NewInt(0),
	)
	if err != nil {
		return "", err
	}

	if err := SendTransaction(
		ctx,
		r.Client,
		tx,
	); err != nil {
		return "", err
	}

	receipt, err := WaitForTransaction(
		ctx,
		r.Client,
		tx,
	)
	if err != nil {
		return "", err
	}

	if receipt.Status != 1 {
		return "", fmt.Errorf(
			"blockchain transaction failed: %s",
			tx.Hash().Hex(),
		)
	}

	return tx.Hash().Hex(), nil
}

func donationIDToBigInt(id uint64) *big.Int {
	return new(big.Int).SetUint64(id)
}
