package commitment

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"math/big"
)

const (
	secretSize = 32
	domain     = "zk-donation-commitment-v1"
)

func GenerateSecret() ([]byte, error) {
	secret := make([]byte, secretSize)

	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}

	return secret, nil
}

func Create(amount string, secret []byte) (string, error) {
	if len(secret) != secretSize {
		return "", errors.New("secret must be 32 bytes")
	}

	message, ok := new(big.Int).SetString(amount, 10)
	if !ok {
		return "", errors.New("invalid amount")
	}

	if message.Sign() <= 0 {
		return "", errors.New("amount must be greater than zero")
	}

	amountBytes := message.Bytes()

	hash := sha256.New()

	hash.Write([]byte(domain))
	hash.Write([]byte{0})
	hash.Write(amountBytes)
	hash.Write([]byte{0})
	hash.Write(secret)

	return hex.EncodeToString(hash.Sum(nil)), nil
}

func Verify(commitment string, amount string, secret []byte) bool {
	expected, err := Create(amount, secret)
	if err != nil {
		return false
	}

	return subtle.ConstantTimeCompare(
		[]byte(commitment),
		[]byte(expected),
	) == 1
}
