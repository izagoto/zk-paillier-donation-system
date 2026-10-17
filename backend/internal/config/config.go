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
	// Batas percobaan login gagal per IP (in-memory).
	AuthLoginMaxAttempts int
	AuthLoginWindowMin   int
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

	loginMax := 10
	if raw := os.Getenv("AUTH_LOGIN_MAX_ATTEMPTS"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			loginMax = parsed
		}
	}

	loginWindowMin := 15
	if raw := os.Getenv("AUTH_LOGIN_WINDOW_MIN"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			loginWindowMin = parsed
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
		AuthLoginMaxAttempts: loginMax,
		AuthLoginWindowMin:   loginWindowMin,
	}, nil
}
