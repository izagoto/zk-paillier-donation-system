package blockchain

import (
	"math/big"
	"testing"
)

func TestNewSigner(t *testing.T) {
	signer, err := NewSigner(
		"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		big.NewInt(31337),
	)
	if err != nil {
		t.Fatalf("failed to create signer: %v", err)
	}

	if signer.PrivateKey == nil {
		t.Fatal("expected private key")
	}

	if signer.Address.Hex() == "" {
		t.Fatal("expected signer address")
	}

	if signer.ChainID.Cmp(big.NewInt(31337)) != 0 {
		t.Fatalf(
			"unexpected chain ID: %s",
			signer.ChainID.String(),
		)
	}
}
