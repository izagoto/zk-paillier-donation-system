package blockchain

import (
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

type Signer struct {
	PrivateKey *ecdsa.PrivateKey
	Address    common.Address
	ChainID    *big.Int
}

func NewSigner(privateKeyHex string, chainID *big.Int) (*Signer, error) {
	privateKeyHex = strings.TrimSpace(privateKeyHex)
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")

	if privateKeyHex == "" {
		return nil, fmt.Errorf("private key is required")
	}

	if chainID == nil {
		return nil, fmt.Errorf("chain ID is required")
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	publicKey, ok := privateKey.Public().(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to derive public key")
	}

	address := crypto.PubkeyToAddress(*publicKey)

	return &Signer{
		PrivateKey: privateKey,
		Address:    address,
		ChainID:    new(big.Int).Set(chainID),
	}, nil
}
