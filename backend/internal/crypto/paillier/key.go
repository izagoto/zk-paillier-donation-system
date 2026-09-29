package paillier

import (
	"encoding/json"
	"errors"
	"math/big"
	"os"
	"path/filepath"
)

type serializedKeypair struct {
	N      string `json:"n"`
	N2     string `json:"n2"`
	G      string `json:"g"`
	Lambda string `json:"lambda"`
	Mu     string `json:"mu"`
}

func SaveKeypair(
	path string,
	publicKey *PublicKey,
	privateKey *PrivateKey,
) error {
	if publicKey == nil || privateKey == nil {
		return errors.New("keypair cannot be nil")
	}

	data := serializedKeypair{
		N:      publicKey.N.String(),
		N2:     publicKey.N2.String(),
		G:      publicKey.G.String(),
		Lambda: privateKey.Lambda.String(),
		Mu:     privateKey.Mu.String(),
	}

	encoded, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	dir := filepath.Dir(path)

	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}

	return os.WriteFile(path, encoded, 0600)
}

func LoadKeypair(
	path string,
) (*PublicKey, *PrivateKey, error) {
	encoded, err := os.ReadFile(path)
	if err != nil {
		return nil, nil, err
	}

	var data serializedKeypair

	if err := json.Unmarshal(encoded, &data); err != nil {
		return nil, nil, err
	}

	n, err := parseBigInt(data.N)
	if err != nil {
		return nil, nil, errors.New("invalid n")
	}

	n2, err := parseBigInt(data.N2)
	if err != nil {
		return nil, nil, errors.New("invalid n2")
	}

	g, err := parseBigInt(data.G)
	if err != nil {
		return nil, nil, errors.New("invalid g")
	}

	lambda, err := parseBigInt(data.Lambda)
	if err != nil {
		return nil, nil, errors.New("invalid lambda")
	}

	mu, err := parseBigInt(data.Mu)
	if err != nil {
		return nil, nil, errors.New("invalid mu")
	}

	publicKey := &PublicKey{
		N:  n,
		N2: n2,
		G:  g,
	}

	privateKey := &PrivateKey{
		PublicKey: *publicKey,
		Lambda:    lambda,
		Mu:        mu,
	}

	return publicKey, privateKey, nil
}

func parseBigInt(value string) (*big.Int, error) {
	if value == "" {
		return nil, errors.New("empty integer")
	}

	result, ok := new(big.Int).SetString(value, 10)
	if !ok {
		return nil, errors.New("invalid integer")
	}

	return result, nil
}
