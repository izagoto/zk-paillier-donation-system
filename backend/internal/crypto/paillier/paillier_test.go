package paillier

import (
	"math/big"
	"testing"
)

func TestEncryptDecrypt(t *testing.T) {
	publicKey, privateKey, err := GenerateKeypair(512)
	if err != nil {
		t.Fatalf("failed to generate keypair: %v", err)
	}

	amount := big.NewInt(100000)

	ciphertext, err := publicKey.Encrypt(amount)
	if err != nil {
		t.Fatalf("failed to encrypt: %v", err)
	}

	decrypted, err := privateKey.Decrypt(ciphertext)
	if err != nil {
		t.Fatalf("failed to decrypt: %v", err)
	}

	if decrypted.Cmp(amount) != 0 {
		t.Fatalf(
			"decrypted value mismatch: got %s, want %s",
			decrypted.String(),
			amount.String(),
		)
	}
}

func TestHomomorphicAddition(t *testing.T) {
	publicKey, privateKey, err := GenerateKeypair(512)
	if err != nil {
		t.Fatalf("failed to generate keypair: %v", err)
	}

	amount1 := big.NewInt(100000)
	amount2 := big.NewInt(250000)

	ciphertext1, err := publicKey.Encrypt(amount1)
	if err != nil {
		t.Fatalf("failed to encrypt amount1: %v", err)
	}

	ciphertext2, err := publicKey.Encrypt(amount2)
	if err != nil {
		t.Fatalf("failed to encrypt amount2: %v", err)
	}

	encryptedTotal, err := publicKey.Add(
		ciphertext1,
		ciphertext2,
	)
	if err != nil {
		t.Fatalf("failed to add ciphertexts: %v", err)
	}

	decryptedTotal, err := privateKey.Decrypt(encryptedTotal)
	if err != nil {
		t.Fatalf("failed to decrypt total: %v", err)
	}

	expected := new(big.Int).Add(amount1, amount2)

	if decryptedTotal.Cmp(expected) != 0 {
		t.Fatalf(
			"homomorphic addition mismatch: got %s, want %s",
			decryptedTotal.String(),
			expected.String(),
		)
	}
}

func TestSaveAndLoadKeypair(t *testing.T) {
	publicKey, privateKey, err := GenerateKeypair(512)
	if err != nil {
		t.Fatalf("failed to generate keypair: %v", err)
	}

	keyPath := t.TempDir() + "/paillier.json"

	if err := SaveKeypair(
		keyPath,
		publicKey,
		privateKey,
	); err != nil {
		t.Fatalf("failed to save keypair: %v", err)
	}

	loadedPublicKey, loadedPrivateKey, err := LoadKeypair(keyPath)
	if err != nil {
		t.Fatalf("failed to load keypair: %v", err)
	}

	if loadedPublicKey.N.Cmp(publicKey.N) != 0 {
		t.Fatal("loaded public key N does not match")
	}

	if loadedPublicKey.N2.Cmp(publicKey.N2) != 0 {
		t.Fatal("loaded public key N2 does not match")
	}

	if loadedPublicKey.G.Cmp(publicKey.G) != 0 {
		t.Fatal("loaded public key G does not match")
	}

	if loadedPrivateKey.Lambda.Cmp(privateKey.Lambda) != 0 {
		t.Fatal("loaded private key lambda does not match")
	}

	if loadedPrivateKey.Mu.Cmp(privateKey.Mu) != 0 {
		t.Fatal("loaded private key mu does not match")
	}

	amount := big.NewInt(100000)

	ciphertext, err := loadedPublicKey.Encrypt(amount)
	if err != nil {
		t.Fatalf("failed to encrypt with loaded key: %v", err)
	}

	decrypted, err := loadedPrivateKey.Decrypt(ciphertext)
	if err != nil {
		t.Fatalf("failed to decrypt with loaded key: %v", err)
	}

	if decrypted.Cmp(amount) != 0 {
		t.Fatalf(
			"decrypted value mismatch: got %s, want %s",
			decrypted.String(),
			amount.String(),
		)
	}
}

func TestKeyManagerLoadOrGenerate(t *testing.T) {
	keyPath := t.TempDir() + "/paillier.json"

	manager := NewKeyManager(keyPath, 512)

	if err := manager.LoadOrGenerate(); err != nil {
		t.Fatalf("failed to generate keypair: %v", err)
	}

	if manager.PublicKey == nil {
		t.Fatal("public key is nil")
	}

	if manager.PrivateKey == nil {
		t.Fatal("private key is nil")
	}

	firstN := new(big.Int).Set(manager.PublicKey.N)

	manager2 := NewKeyManager(keyPath, 512)

	if err := manager2.LoadOrGenerate(); err != nil {
		t.Fatalf("failed to load keypair: %v", err)
	}

	if manager2.PublicKey == nil {
		t.Fatal("loaded public key is nil")
	}

	if manager2.PrivateKey == nil {
		t.Fatal("loaded private key is nil")
	}

	if manager2.PublicKey.N.Cmp(firstN) != 0 {
		t.Fatal("loaded keypair does not match original keypair")
	}
}
