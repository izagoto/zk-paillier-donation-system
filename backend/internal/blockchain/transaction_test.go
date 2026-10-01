package blockchain

import (
	"context"
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func TestBuildSignedTransaction(t *testing.T) {
	client, err := NewClient("http://127.0.0.1:8545")
	if err != nil {
		t.Fatalf("failed to connect to Hardhat: %v", err)
	}
	defer client.Close()

	signer, err := NewSigner(
		"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		big.NewInt(31337),
	)
	if err != nil {
		t.Fatalf("failed to create signer: %v", err)
	}

	to := common.HexToAddress(
		"0x5FbDB2315678afecb367f032d93F642f64180aa3",
	)

	contract, err := LoadContract(
		"0x5FbDB2315678afecb367f032d93F642f64180aa3",
		"abi/DonationRegistry.json",
	)
	if err != nil {
		t.Fatalf("failed to load contract: %v", err)
	}

	campaignID := common.HexToHash(
		"0x6f76b55b5fb7db5ae822c5f21fa38d28a97b75e8c85d78ce14967d5bfb6677ff",
	)

	commitment := common.HexToHash(
		"0x27651149e7b9fb5f2864c59cba14652b7dcb4814b1113b9e7b6be726a1689138",
	)

	data, err := contract.ABI.Pack(
		"recordDonation",
		campaignID,
		commitment,
		[]byte("paillier-ciphertext-test"),
		[]byte("groth16-proof-test"),
	)
	if err != nil {
		t.Fatalf("failed to pack recordDonation: %v", err)
	}

	tx, err := BuildSignedTransaction(
		context.Background(),
		client,
		signer,
		to,
		data,
		big.NewInt(0),
	)
	if err != nil {
		t.Fatalf("failed to build signed transaction: %v", err)
	}

	if tx == nil {
		t.Fatal("expected signed transaction")
	}

	if tx.To() == nil {
		t.Fatal("expected transaction destination")
	}

	if tx.To().Hex() != to.Hex() {
		t.Fatalf(
			"unexpected transaction destination: got %s, want %s",
			tx.To().Hex(),
			to.Hex(),
		)
	}

	if string(tx.Data()) != string(data) {
		t.Fatal("unexpected transaction data")
	}

	if tx.ChainId().Cmp(big.NewInt(31337)) != 0 {
		t.Fatalf(
			"unexpected chain ID: got %s, want 31337",
			tx.ChainId(),
		)
	}

	signerFn := types.LatestSignerForChainID(tx.ChainId())

	sender, err := types.Sender(signerFn, tx)
	if err != nil {
		t.Fatalf("failed to recover transaction sender: %v", err)
	}

	if sender != signer.Address {
		t.Fatalf(
			"unexpected transaction sender: got %s, want %s",
			sender.Hex(),
			signer.Address.Hex(),
		)
	}
}
