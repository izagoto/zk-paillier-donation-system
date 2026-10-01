package blockchain

import "testing"

func TestNewDonationPayload(t *testing.T) {
	payload := NewDonationPayload(
		"129985da-a035-4045-886f-2ae46af1edb3",
		"17818771970457656005405685650288395692340568608784365030838613517333055443256",
		"paillier-ciphertext-test",
		"groth16-proof-test",
	)

	if payload.CampaignID != "129985da-a035-4045-886f-2ae46af1edb3" {
		t.Fatalf("unexpected campaign ID: %s", payload.CampaignID)
	}

	if payload.Commitment != "17818771970457656005405685650288395692340568608784365030838613517333055443256" {
		t.Fatalf("unexpected commitment: %s", payload.Commitment)
	}

	if payload.EncryptedAmount != "paillier-ciphertext-test" {
		t.Fatalf("unexpected encrypted amount: %s", payload.EncryptedAmount)
	}

	if payload.ZKProof != "groth16-proof-test" {
		t.Fatalf("unexpected ZK proof: %s", payload.ZKProof)
	}
}