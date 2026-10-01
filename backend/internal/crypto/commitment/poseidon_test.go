package commitment

import (
	"math/big"
	"testing"

	"github.com/iden3/go-iden3-crypto/poseidon"
)

func TestPoseidonCompatibility(t *testing.T) {
	amount := big.NewInt(100000)
	secret := big.NewInt(123456789)

	expected := "17818771970457656005405685650288395692340568608784365030838613517333055443256"

	hash, err := poseidon.Hash([]*big.Int{
		amount,
		secret,
	})
	if err != nil {
		t.Fatalf("poseidon hash failed: %v", err)
	}

	actual := hash.String()

	if actual != expected {
		t.Fatalf(
			"poseidon mismatch: got %s, want %s",
			actual,
			expected,
		)
	}
}

func TestCreatePoseidon(t *testing.T) {
	amount := "100000"
	secret := big.NewInt(123456789)

	expected := "17818771970457656005405685650288395692340568608784365030838613517333055443256"

	actual, err := CreatePoseidon(amount, secret)
	if err != nil {
		t.Fatalf("create poseidon commitment failed: %v", err)
	}

	if actual != expected {
		t.Fatalf(
			"poseidon commitment mismatch: got %s, want %s",
			actual,
			expected,
		)
	}
}
