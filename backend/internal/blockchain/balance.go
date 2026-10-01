package blockchain

import (
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

func GetBalance(
	ctx context.Context,
	client *Client,
	address common.Address,
) (*big.Int, error) {
	if client == nil || client.Eth == nil {
		return nil, fmt.Errorf("blockchain client is required")
	}

	balance, err := client.Eth.BalanceAt(ctx, address, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get account balance: %w", err)
	}

	return balance, nil
}
