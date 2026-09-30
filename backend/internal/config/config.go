package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort         string
	DatabaseURL     string
	JWTSecret       string
	PaillierKeyPath string
	PaillierKeySize int
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}

	keySize, err := strconv.Atoi(os.Getenv("PAILLIER_KEY_SIZE"))
	if err != nil {
		return nil, err
	}

	return &Config{
		AppPort:         os.Getenv("APP_PORT"),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		JWTSecret:       os.Getenv("JWT_SECRET"),
		PaillierKeyPath: os.Getenv("PAILLIER_KEY_PATH"),
		PaillierKeySize: keySize,
	}, nil
}
