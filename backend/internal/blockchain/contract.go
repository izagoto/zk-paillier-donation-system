package blockchain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi"
)

type Contract struct {
	Address string
	ABI     abi.ABI
}

func LoadContract(address string, abiPath string) (*Contract, error) {
	data, err := os.ReadFile(abiPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read contract ABI: %w", err)
	}

	var artifact struct {
		ABI json.RawMessage `json:"abi"`
	}

	if err := json.Unmarshal(data, &artifact); err != nil {
		return nil, fmt.Errorf("failed to parse contract artifact: %w", err)
	}

	parsedABI, err := abi.JSON(
		bytes.NewReader(artifact.ABI),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to parse contract ABI: %w", err)
	}

	return &Contract{
		Address: address,
		ABI:     parsedABI,
	}, nil
}