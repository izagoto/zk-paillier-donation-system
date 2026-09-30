package main

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"github.com/izagoto/zk-paillier-donation-system/internal/config"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	keyManager := paillier.NewKeyManager(
		cfg.PaillierKeyPath,
		cfg.PaillierKeySize,
	)

	if err := keyManager.LoadOrGenerate(); err != nil {
		log.Fatal(err)
	}

	db, err := database.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	const campaignID = "129985da-a035-4045-886f-2ae46af1edb3"

	var encryptedTotal string

	err = db.QueryRow(
		context.Background(),
		`
		SELECT encrypted_total
		FROM campaign_aggregates
		WHERE campaign_id = $1
		`,
		campaignID,
	).Scan(&encryptedTotal)
	if err != nil {
		log.Fatal(err)
	}

	ciphertext, ok := new(big.Int).SetString(
		encryptedTotal,
		10,
	)
	if !ok {
		log.Fatal("invalid encrypted total")
	}

	total, err := keyManager.PrivateKey.Decrypt(ciphertext)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Campaign:", campaignID)
	fmt.Println("Encrypted aggregate loaded: yes")
	fmt.Println("Decrypted aggregate:", total.String())
}
