package blockchain

import (
	"context"
	"fmt"

	"github.com/ethereum/go-ethereum/ethclient"
)

type Client struct {
	RPCURL string
	Eth    *ethclient.Client
}

func NewClient(rpcURL string) (*Client, error) {
	eth, err := ethclient.DialContext(context.Background(), rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to blockchain RPC: %w", err)
	}

	return &Client{
		RPCURL: rpcURL,
		Eth:    eth,
	}, nil
}

func (c *Client) Close() {
	if c.Eth != nil {
		c.Eth.Close()
	}
}