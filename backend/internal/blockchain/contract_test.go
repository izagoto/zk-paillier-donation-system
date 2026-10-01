package blockchain

import "testing"

func TestLoadContract(t *testing.T) {
	contract, err := LoadContract(
		"0x5FbDB2315678afecb367f032d93F642f64180aa3",
		"abi/DonationRegistry.json",
	)
	if err != nil {
		t.Fatalf("failed to load contract: %v", err)
	}

	if contract.Address != "0x5FbDB2315678afecb367f032d93F642f64180aa3" {
		t.Fatalf("unexpected contract address: %s", contract.Address)
	}

	method, ok := contract.ABI.Methods["recordDonation"]
	if !ok {
		t.Fatal("recordDonation method not found in ABI")
	}

	if method.Name != "recordDonation" {
		t.Fatalf("unexpected method name: %s", method.Name)
	}
}