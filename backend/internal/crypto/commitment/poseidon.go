package commitment

import (
	"errors"
	"math/big"

	"github.com/iden3/go-iden3-crypto/poseidon"
)

func CreatePoseidon(amount string, secret *big.Int) (string, error) {
	if amount == "" {
		return "", errors.New("amount is required")
	}

	if secret == nil {
		return "", errors.New("secret is required")
	}

	message, ok := new(big.Int).SetString(amount, 10)
	if !ok {
		return "", errors.New("invalid amount")
	}

	if message.Sign() <= 0 {
		return "", errors.New("amount must be positive")
	}

	if secret.Sign() < 0 {
		return "", errors.New("secret must not be negative")
	}

	hash, err := poseidon.Hash([]*big.Int{
		message,
		secret,
	})
	if err != nil {
		return "", err
	}

	return hash.String(), nil
}
