package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort              string
	DatabaseURL          string
	JWTSecret            string
	PaillierKeyPath      string
	PaillierKeySize      int
	BlockchainRPCURL     string
	BlockchainContract   string
	BlockchainPrivateKey string
	BootstrapToken       string
	// Detik antar rekonsiliasi donasi pending; 0 = nonaktif.
	PendingReconcileSec int
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	keySize, err := strconv.Atoi(os.Getenv("PAILLIER_KEY_SIZE"))
	if err != nil {
		return nil, err
	}

	pendingSec := 120
	if raw := os.Getenv("DONATION_PENDING_RECONCILE_SEC"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			pendingSec = parsed
		}
	}

	return &Config{
		AppPort:              os.Getenv("APP_PORT"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		JWTSecret:            os.Getenv("JWT_SECRET"),
		PaillierKeyPath:      os.Getenv("PAILLIER_KEY_PATH"),
		PaillierKeySize:      keySize,
		BlockchainRPCURL:     os.Getenv("BLOCKCHAIN_RPC_URL"),
		BlockchainContract:   os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS"),
		BlockchainPrivateKey: os.Getenv("BLOCKCHAIN_PRIVATE_KEY"),
		BootstrapToken:       os.Getenv("BOOTSTRAP_TOKEN"),
		PendingReconcileSec:  pendingSec,
	}, nil
}
