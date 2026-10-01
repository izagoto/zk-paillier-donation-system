package main

import (
	"context"
	"log"

	"github.com/izagoto/zk-paillier-donation-system/internal/blockchain"
	"github.com/izagoto/zk-paillier-donation-system/internal/config"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/database"
	"github.com/izagoto/zk-paillier-donation-system/internal/router"
	"github.com/izagoto/zk-paillier-donation-system/internal/zk"
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

	zkVerifier, err := zk.NewVerifier()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("ZK verifier loaded")

	blockchainClient, err := blockchain.NewClient(cfg.BlockchainRPCURL)
	if err != nil {
		log.Fatal(err)
	}
	defer blockchainClient.Close()

	log.Println("Blockchain RPC connected")

	blockchainContract, err := blockchain.LoadContract(
		cfg.BlockchainContract,
		"internal/blockchain/abi/DonationRegistry.json",
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Blockchain contract loaded")

	chainID, err := blockchainClient.Eth.ChainID(
		context.Background(),
	)
	if err != nil {
		log.Fatal(err)
	}

	blockchainSigner, err := blockchain.NewSigner(
		cfg.BlockchainPrivateKey,
		chainID,
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf(
		"Blockchain signer loaded: %s",
		blockchainSigner.Address.Hex(),
	)

	blockchainRegistry, err := blockchain.NewRegistry(
		blockchainClient,
		blockchainContract,
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Blockchain registry loaded")

	db, err := database.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	r := router.Setup(
		db,
		cfg.JWTSecret,
		paillierKeyManager.PublicKey,
		zkVerifier,
		blockchainRegistry,
		blockchainSigner,
	)

	log.Printf("server running on :%s", cfg.AppPort)

	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
