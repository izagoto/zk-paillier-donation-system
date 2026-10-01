package blockchain

import (
	"bytes"
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

func TestPackRecordDonation(t *testing.T) {
	client, err := NewClient("http://127.0.0.1:8545")
	if err != nil {
		t.Fatalf("failed to connect to blockchain: %v", err)
	}
	defer client.Close()

	contract, err := LoadContract(
		"0x5FbDB2315678afecb367f032d93F642f64180aa3",
		"abi/DonationRegistry.json",
	)
	if err != nil {
		t.Fatalf("failed to load contract: %v", err)
	}

	registry, err := NewRegistry(client, contract)
	if err != nil {
		t.Fatalf("failed to create registry: %v", err)
	}

	campaignID := common.HexToHash(
		"0x6f76b55b5fb7db5ae822c5f21fa38d28a97b75e8c85d78ce14967d5bfb6677ff",
	)

	commitment := common.HexToHash(
		"0x27651149e7b9fb5f2864c59cba14652b7dcb4814b1113b9e7b6be726a1689138",
	)

	encryptedAmount := []byte("paillier-ciphertext-test")
	zkProof := []byte("groth16-proof-test")

	data, err := registry.PackRecordDonation(
		campaignID,
		commitment,
		encryptedAmount,
		zkProof,
	)
	if err != nil {
		t.Fatalf("failed to pack recordDonation: %v", err)
	}

	if len(data) == 0 {
		t.Fatal("expected calldata, got empty data")
	}

	expectedMethodID := registry.Contract.ABI.Methods["recordDonation"].ID

	if !bytes.Equal(data[:4], expectedMethodID) {
		t.Fatalf("unexpected method selector: got %x, want %x", data[:4], expectedMethodID)
	}
}
