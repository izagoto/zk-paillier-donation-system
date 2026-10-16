package blockchain

import (
	"context"
	"encoding/json"
	"math/big"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

type transactionTestZKProof struct {
	PiA      []string   `json:"pi_a"`
	PiB      [][]string `json:"pi_b"`
	PiC      []string   `json:"pi_c"`
	Protocol string     `json:"protocol"`
	Curve    string     `json:"curve"`
}

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
		"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
	)

	contract, err := LoadContract(
		"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		"abi/DonationRegistry.json",
	)
	if err != nil {
		t.Fatalf("failed to load contract: %v", err)
	}

	// Resolve project root from this test file:
	// backend/internal/blockchain/transaction_test.go
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("failed to determine current test file path")
	}

	backendDir := filepath.Join(
		filepath.Dir(currentFile),
		"..",
		"..",
	)

	projectDir := filepath.Join(
		backendDir,
		"..",
	)

	proofPath := filepath.Join(
		projectDir,
		"zk",
		"build",
		"donation-proof.json",
	)

	publicPath := filepath.Join(
		projectDir,
		"zk",
		"build",
		"donation-public.json",
	)

	proofData, err := os.ReadFile(proofPath)
	if err != nil {
		t.Fatalf(
			"failed to read ZK proof: %v",
			err,
		)
	}

	publicData, err := os.ReadFile(publicPath)
	if err != nil {
		t.Fatalf(
			"failed to read ZK public inputs: %v",
			err,
		)
	}

	var proof transactionTestZKProof

	if err := json.Unmarshal(proofData, &proof); err != nil {
		t.Fatalf(
			"failed to parse ZK proof: %v",
			err,
		)
	}

	var publicSignals []string

	if err := json.Unmarshal(
		publicData,
		&publicSignals,
	); err != nil {
		t.Fatalf(
			"failed to parse ZK public inputs: %v",
			err,
		)
	}

	if len(publicSignals) != 2 {
		t.Fatalf(
			"expected 2 public signals, got %d",
			len(publicSignals),
		)
	}

	// Public signals:
	//
	// [0] campaign_max
	// [1] commitment

	campaignMax, ok := new(big.Int).SetString(
		publicSignals[0],
		10,
	)
	if !ok {
		t.Fatal("invalid campaign_max public signal")
	}

	commitmentInt, ok := new(big.Int).SetString(
		publicSignals[1],
		10,
	)
	if !ok {
		t.Fatal("invalid commitment public signal")
	}

	commitment := common.BytesToHash(
		commitmentInt.Bytes(),
	)

	if len(proof.PiA) < 2 {
		t.Fatal("invalid proof: pi_a")
	}

	if len(proof.PiB) < 2 ||
		len(proof.PiB[0]) < 2 ||
		len(proof.PiB[1]) < 2 {
		t.Fatal("invalid proof: pi_b")
	}

	if len(proof.PiC) < 2 {
		t.Fatal("invalid proof: pi_c")
	}

	pA0, ok := new(big.Int).SetString(
		proof.PiA[0],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_a[0]")
	}

	pA1, ok := new(big.Int).SetString(
		proof.PiA[1],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_a[1]")
	}

	pB00, ok := new(big.Int).SetString(
		proof.PiB[0][1],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_b[0][1]")
	}

	pB01, ok := new(big.Int).SetString(
		proof.PiB[0][0],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_b[0][0]")
	}

	pB10, ok := new(big.Int).SetString(
		proof.PiB[1][1],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_b[1][1]")
	}

	pB11, ok := new(big.Int).SetString(
		proof.PiB[1][0],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_b[1][0]")
	}

	pC0, ok := new(big.Int).SetString(
		proof.PiC[0],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_c[0]")
	}

	pC1, ok := new(big.Int).SetString(
		proof.PiC[1],
		10,
	)
	if !ok {
		t.Fatal("invalid proof: pi_c[1]")
	}

	pA := [2]*big.Int{
		pA0,
		pA1,
	}

	pB := [2][2]*big.Int{
		{
			pB00,
			pB01,
		},
		{
			pB10,
			pB11,
		},
	}

	pC := [2]*big.Int{
		pC0,
		pC1,
	}

	pubSignals := [2]*big.Int{
		campaignMax,
		commitmentInt,
	}

	campaignID := common.HexToHash(
		"0x6f76b55b5fb7db5ae822c5f21fa38d28a97b75e8c85d78ce14967d5bfb6677ff",
	)

	encryptedAmount := []byte(
		"paillier-ciphertext-test",
	)

	data, err := contract.ABI.Pack(
		"recordDonation",
		campaignID,
		commitment,
		encryptedAmount,
		pA,
		pB,
		pC,
		pubSignals,
	)
	if err != nil {
		t.Fatalf(
			"failed to pack recordDonation: %v",
			err,
		)
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
		t.Fatalf(
			"failed to build signed transaction: %v",
			err,
		)
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
		t.Fatalf(
			"failed to recover transaction sender: %v",
			err,
		)
	}

	if sender != signer.Address {
		t.Fatalf(
			"unexpected transaction sender: got %s, want %s",
			sender.Hex(),
			signer.Address.Hex(),
		)
	}
}
