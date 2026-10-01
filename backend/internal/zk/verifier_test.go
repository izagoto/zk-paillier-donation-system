package zk

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestVerifierValidProof(t *testing.T) {
	verifier, err := NewVerifier()
	if err != nil {
		t.Fatalf("create verifier: %v", err)
	}

	publicInput, err := os.ReadFile(
		filepath.Join("testdata", "public.json"),
	)
	if err != nil {
		t.Fatalf("read public input: %v", err)
	}

	proof, err := os.ReadFile(
		filepath.Join("testdata", "proof.json"),
	)
	if err != nil {
		t.Fatalf("read proof: %v", err)
	}

	err = verifier.Verify(
		context.Background(),
		publicInput,
		proof,
	)
	if err != nil {
		t.Fatalf("expected valid proof, got error: %v", err)
	}
}

func TestVerifierInvalidProof(t *testing.T) {
	verifier, err := NewVerifier()
	if err != nil {
		t.Fatalf("create verifier: %v", err)
	}

	publicInput, err := os.ReadFile(
		filepath.Join("testdata", "public-invalid.json"),
	)
	if err != nil {
		t.Fatalf("read invalid public input: %v", err)
	}

	proof, err := os.ReadFile(
		filepath.Join("testdata", "proof.json"),
	)
	if err != nil {
		t.Fatalf("read proof: %v", err)
	}

	err = verifier.Verify(
		context.Background(),
		publicInput,
		proof,
	)
	if err == nil {
		t.Fatal("expected invalid proof, got nil")
	}
}

func TestVerifierStructuredProof(t *testing.T) {
	verifier, err := NewVerifier()
	if err != nil {
		t.Fatalf("create verifier: %v", err)
	}

	proofData, err := os.ReadFile(
		filepath.Join("testdata", "proof.json"),
	)
	if err != nil {
		t.Fatalf("read proof: %v", err)
	}

	var proof Proof

	if err := json.Unmarshal(proofData, &proof); err != nil {
		t.Fatalf("unmarshal proof: %v", err)
	}

	publicInputs := PublicInputs{
		CampaignMax: "5000000",
		Commitment:  "17818771970457656005405685650288395692340568608784365030838613517333055443256",
	}

	err = verifier.VerifyProof(
		context.Background(),
		proof,
		publicInputs,
	)
	if err != nil {
		t.Fatalf("expected valid proof, got error: %v", err)
	}
}
