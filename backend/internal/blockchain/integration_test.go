package blockchain

import (
	"context"
	"math/big"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/joho/godotenv"
)

func TestRecordDonationOnHardhat(t *testing.T) {
	// Determine the absolute path of this test file.
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("failed to determine current test file path")
	}

	// Current file:
	// backend/internal/blockchain/integration_test.go
	//
	// Move two levels up:
	// backend/internal/blockchain
	//              -> backend/internal
	//              -> backend
	backendDir := filepath.Join(
		filepath.Dir(currentFile),
		"..",
		"..",
	)

	// Load backend/.env using an absolute path.
	envPath := filepath.Join(backendDir, ".env")

	if err := godotenv.Load(envPath); err != nil {
		t.Fatalf("failed to load .env: %v", err)
	}

	privateKey := os.Getenv("BLOCKCHAIN_PRIVATE_KEY")
	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	contractAddress := os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS")

	if privateKey == "" {
		t.Fatal("BLOCKCHAIN_PRIVATE_KEY is not configured")
	}

	if rpcURL == "" {
		t.Fatal("BLOCKCHAIN_RPC_URL is not configured")
	}

	if contractAddress == "" {
		t.Fatal("BLOCKCHAIN_CONTRACT_ADDRESS is not configured")
	}

	ctx := context.Background()

	// Connect to Hardhat RPC.
	client, err := NewClient(rpcURL)
	if err != nil {
		t.Fatalf("failed to connect to blockchain: %v", err)
	}
	defer client.Close()

	// Get the actual chain ID from the RPC.
	chainID, err := client.Eth.ChainID(ctx)
	if err != nil {
		t.Fatalf("failed to get chain ID: %v", err)
	}

	t.Logf("chain ID: %s", chainID.String())

	// Create Ethereum signer from the private key.
	signer, err := NewSigner(privateKey, chainID)
	if err != nil {
		t.Fatalf("failed to create signer: %v", err)
	}

	t.Logf("signer address: %s", signer.Address.Hex())

	// Load the deployed contract ABI.
	abiPath := filepath.Join(
		backendDir,
		"internal",
		"blockchain",
		"abi",
		"DonationRegistry.json",
	)

	contract, err := LoadContract(
		contractAddress,
		abiPath,
	)
	if err != nil {
		t.Fatalf("failed to load contract: %v", err)
	}

	// Create contract registry wrapper.
	registry, err := NewRegistry(client, contract)
	if err != nil {
		t.Fatalf("failed to create registry: %v", err)
	}

	// Test campaign ID.
	campaignID := common.HexToHash(
		"0x6f76b55b5fb7db5ae822c5f21fa38d28a97b75e8c85d78ce14967d5bfb6677ff",
	)

	// Test Poseidon commitment.
	commitment := common.HexToHash(
		"0x27651149e7b9fb5f2864c59cba14652b7dcb4814b1113b9e7b6be726a1689138",
	)

	// Temporary test data.
	//
	// These are NOT the real Paillier ciphertext
	// and NOT the real Groth16 proof yet.
	encryptedAmount := []byte("paillier-ciphertext-test")
	zkProof := []byte("groth16-proof-test")

	// Encode the Solidity recordDonation(...) call.
	data, err := registry.PackRecordDonation(
		campaignID,
		commitment,
		encryptedAmount,
		zkProof,
	)
	if err != nil {
		t.Fatalf("failed to pack donation: %v", err)
	}

	// Estimate gas before creating the transaction.
	estimatedGas, err := client.Eth.EstimateGas(
		ctx,
		ethereum.CallMsg{
			From: signer.Address,
			To:   &registry.Address,
			Data: data,
		},
	)
	if err != nil {
		t.Fatalf("failed to estimate gas: %v", err)
	}

	t.Logf("estimated gas: %d", estimatedGas)

	// Build and sign the Ethereum transaction.
	tx, err := BuildSignedTransaction(
		ctx,
		client,
		signer,
		registry.Address,
		data,
		big.NewInt(0),
	)
	if err != nil {
		t.Fatalf("failed to build transaction: %v", err)
	}

	if tx.Gas() < estimatedGas {
		t.Fatalf(
			"transaction gas limit is too low: got %d, estimated %d",
			tx.Gas(),
			estimatedGas,
		)
	}

	t.Logf("transaction nonce: %d", tx.Nonce())
	t.Logf("transaction hash: %s", tx.Hash().Hex())

	// Send transaction to Hardhat.
	if err := SendTransaction(ctx, client, tx); err != nil {
		t.Fatalf("failed to send transaction: %v", err)
	}

	// Wait until the transaction is mined.
	receipt, err := WaitForTransaction(ctx, client, tx)
	if err != nil {
		t.Fatalf("failed to wait for transaction: %v", err)
	}

	// Transaction status:
	// 1 = success
	// 0 = reverted
	if receipt.Status != 1 {
		t.Fatalf(
			"transaction failed on chain: status=%d",
			receipt.Status,
		)
	}

	t.Logf(
		"transaction confirmed: hash=%s block=%d",
		tx.Hash().Hex(),
		receipt.BlockNumber.Uint64(),
	)
}
