package paillier

import (
	"errors"
	"os"
)

type KeyManager struct {
	Path       string
	KeySize    int
	PublicKey  *PublicKey
	PrivateKey *PrivateKey
}

func NewKeyManager(path string, keySize int) *KeyManager {
	return &KeyManager{
		Path:    path,
		KeySize: keySize,
	}
}

func (km *KeyManager) LoadOrGenerate() error {
	if km.Path == "" {
		return errors.New("key path is required")
	}

	if km.KeySize < 512 {
		return errors.New("key size must be at least 512 bits")
	}

	if _, err := os.Stat(km.Path); err == nil {
		publicKey, privateKey, err := LoadKeypair(km.Path)
		if err != nil {
			return err
		}

		km.PublicKey = publicKey
		km.PrivateKey = privateKey

		return nil
	}

	publicKey, privateKey, err := GenerateKeypair(km.KeySize)
	if err != nil {
		return err
	}

	if err := SaveKeypair(
		km.Path,
		publicKey,
		privateKey,
	); err != nil {
		return err
	}

	km.PublicKey = publicKey
	km.PrivateKey = privateKey

	return nil
}
