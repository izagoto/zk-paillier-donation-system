package commitment

import (
	"testing"
)

func TestGenerateSecret(t *testing.T) {
	secret, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	if len(secret) != 32 {
		t.Fatalf(
			"expected secret length 32, got %d",
			len(secret),
		)
	}
}

func TestCreateAndVerify(t *testing.T) {
	secret, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	commitment, err := Create("100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	if len(commitment) != 64 {
		t.Fatalf(
			"expected commitment length 64, got %d",
			len(commitment),
		)
	}

	if !Verify(commitment, "100000", secret) {
		t.Fatal("commitment verification failed")
	}
}

func TestVerifyDifferentAmount(t *testing.T) {
	secret, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	commitment, err := Create("100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	if Verify(commitment, "200000", secret) {
		t.Fatal("commitment should not verify with different amount")
	}
}

func TestVerifyDifferentSecret(t *testing.T) {
	secret1, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	secret2, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	commitment, err := Create("100000", secret1)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	if Verify(commitment, "100000", secret2) {
		t.Fatal("commitment should not verify with different secret")
	}
}

func TestSameInputProducesSameCommitment(t *testing.T) {
	secret := make([]byte, 32)

	commitment1, err := Create("100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	commitment2, err := Create("100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	if commitment1 != commitment2 {
		t.Fatal("same input should produce same commitment")
	}
}

func TestLeadingZerosRepresentSameAmount(t *testing.T) {
	secret := make([]byte, 32)

	commitment1, err := Create("100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	commitment2, err := Create("000100000", secret)
	if err != nil {
		t.Fatalf("failed to create commitment: %v", err)
	}

	if commitment1 != commitment2 {
		t.Fatal("numerically equal amounts should produce the same commitment")
	}
}
