package blockchain

import (
	"testing"
)

func TestNewClient(t *testing.T) {
	client, err := NewClient("http://127.0.0.1:8545")
	if err != nil {
		t.Fatalf("failed to connect to Hardhat RPC: %v", err)
	}

	defer client.Close()

	if client.Eth == nil {
		t.Fatal("expected Ethereum client to be initialized")
	}
}