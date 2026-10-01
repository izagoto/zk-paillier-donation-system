package blockchain

import (
	"math/big"
	"os"
	"testing"
)

func TestBlockchainConfiguration(t *testing.T) {
	privateKey := os.Getenv("BLOCKCHAIN_PRIVATE_KEY")
	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	contractAddress := os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS")

	if privateKey == "" {
		t.Skip("BLOCKCHAIN_PRIVATE_KEY is not set")
	}

	if rpcURL == "" {
		t.Fatal("BLOCKCHAIN_RPC_URL is not set")
	}

	if contractAddress == "" {
		t.Fatal("BLOCKCHAIN_CONTRACT_ADDRESS is not set")
	}

	signer, err := NewSigner(
		privateKey,
		big.NewInt(31337),
	)
	if err != nil {
		t.Fatalf("failed to create signer: %v", err)
	}

	client, err := NewClient(rpcURL)
	if err != nil {
		t.Fatalf("failed to connect to blockchain: %v", err)
	}
	defer client.Close()

	balance, err := GetBalance(
		t.Context(),
		client,
		signer.Address,
	)
	if err != nil {
		t.Fatalf("failed to get signer balance: %v", err)
	}

	if balance.Sign() <= 0 {
		t.Fatal("signer account has no ETH")
	}
}
