package main

import (
	"log"

	"github.com/izagoto/zk-paillier-donation-system/internal/config"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/database"
	"github.com/izagoto/zk-paillier-donation-system/internal/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	paillierKeyManager := paillier.NewKeyManager(
		cfg.PaillierKeyPath,
		cfg.PaillierKeySize,
	)

	if err := paillierKeyManager.LoadOrGenerate(); err != nil {
		log.Fatal(err)
	}

	log.Println("Paillier keypair loaded")

	db, err := database.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	r := router.Setup(db, cfg.JWTSecret, paillierKeyManager.PublicKey)

	log.Printf("server running on :%s", cfg.AppPort)

	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
