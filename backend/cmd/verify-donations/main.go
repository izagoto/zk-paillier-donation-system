package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/izagoto/zk-paillier-donation-system/internal/config"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/database"
)

type donation struct {
	ID              string
	Commitment      string
	EncryptedAmount string
	Status          string
	TxHash          string
	CreatedAt       time.Time
}

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

	rows, err := db.Query(
		context.Background(),
		`
		SELECT
			id,
			commitment,
			encrypted_amount,
			status,
			COALESCE(tx_hash, ''),
			created_at
		FROM donations
		WHERE campaign_id = $1
		ORDER BY created_at, id
		`,
		campaignID,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var donations []donation

	for rows.Next() {
		var d donation

		if err := rows.Scan(
			&d.ID,
			&d.Commitment,
			&d.EncryptedAmount,
			&d.Status,
			&d.TxHash,
			&d.CreatedAt,
		); err != nil {
			log.Fatal(err)
		}

		donations = append(donations, d)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Campaign:", campaignID)
	fmt.Println("Total donations:", len(donations))
	fmt.Println()

	var confirmedTotal big.Int

	for i, d := range donations {
		ciphertext, ok := new(big.Int).SetString(
			d.EncryptedAmount,
			10,
		)
		if !ok {
			log.Fatalf(
				"invalid encrypted amount for donation %s",
				d.ID,
			)
		}

		amount, err := keyManager.PrivateKey.Decrypt(ciphertext)
		if err != nil {
			log.Fatalf(
				"failed to decrypt donation %s: %v",
				d.ID,
				err,
			)
		}

		if d.Status == "confirmed" {
			confirmedTotal.Add(&confirmedTotal, amount)
		}

		txStatus := "NO_TX"
		if d.TxHash != "" {
			txStatus = d.TxHash
		}

		fmt.Printf("%d. Donation: %s\n", i+1, d.ID)
		fmt.Printf("   Commitment: %s\n", d.Commitment)
		fmt.Printf("   Amount: %s\n", amount.String())
		fmt.Printf("   Status: %s\n", d.Status)
		fmt.Printf("   Tx: %s\n", txStatus)
		fmt.Printf(
			"   Created: %s\n",
			d.CreatedAt.Format(time.RFC3339),
		)
		fmt.Println()
	}

	fmt.Println(
		"Decrypted confirmed total:",
		confirmedTotal.String(),
	)
}
