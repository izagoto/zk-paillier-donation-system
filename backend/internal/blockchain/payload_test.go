package blockchain

import "testing"

func TestNewDonationPayload(t *testing.T) {
	payload := NewDonationPayload(
		"campaign-id",
		"5000000",
		"commitment",
		"encrypted-amount",
		"zk-proof",
	)

	if payload.CampaignID != "campaign-id" {
		t.Fatalf(
			"unexpected campaign ID: %s",
			payload.CampaignID,
		)
	}

	if payload.CampaignMax != "5000000" {
		t.Fatalf(
			"unexpected campaign max: %s",
			payload.CampaignMax,
		)
	}

	if payload.Commitment != "commitment" {
		t.Fatalf(
			"unexpected commitment: %s",
			payload.Commitment,
		)
	}

	if payload.EncryptedAmount != "encrypted-amount" {
		t.Fatalf(
			"unexpected encrypted amount: %s",
			payload.EncryptedAmount,
		)
	}

	if payload.ZKProof != "zk-proof" {
		t.Fatalf(
			"unexpected ZK proof: %s",
			payload.ZKProof,
		)
	}
}
