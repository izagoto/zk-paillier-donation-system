package zk

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

type Verifier struct {
	NpxPath          string
	VerificationKey  string
	WorkingDirectory string
}

func NewVerifier() (*Verifier, error) {
	npxPath, err := exec.LookPath("npx")
	if err != nil {
		return nil, fmt.Errorf("npx not found: %w", err)
	}

	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		return nil, fmt.Errorf("cannot determine verifier source path")
	}

	projectRoot := filepath.Clean(
		filepath.Join(
			filepath.Dir(sourceFile),
			"../../..",
		),
	)

	return &Verifier{
		NpxPath: npxPath,
		VerificationKey: filepath.Join(
			projectRoot,
			"zk",
			"build",
			"verification_key.json",
		),
		WorkingDirectory: projectRoot,
	}, nil
}

func (v *Verifier) Verify(
	ctx context.Context,
	publicInput []byte,
	proof []byte,
) error {
	tempDir, err := os.MkdirTemp("", "zk-verifier-*")
	if err != nil {
		return fmt.Errorf("create verifier temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	publicInputPath := filepath.Join(tempDir, "public.json")
	proofPath := filepath.Join(tempDir, "proof.json")

	if err := os.WriteFile(publicInputPath, publicInput, 0600); err != nil {
		return fmt.Errorf("write public input: %w", err)
	}

	if err := os.WriteFile(proofPath, proof, 0600); err != nil {
		return fmt.Errorf("write proof: %w", err)
	}

	cmd := exec.CommandContext(
		ctx,
		v.NpxPath,
		"snarkjs",
		"groth16",
		"verify",
		v.VerificationKey,
		publicInputPath,
		proofPath,
	)

	cmd.Dir = v.WorkingDirectory

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf(
			"zk proof verification failed: %s",
			string(output),
		)
	}

	return nil
}
func (v *Verifier) VerifyProof(
	ctx context.Context,
	proof Proof,
	publicInputs PublicInputs,
) error {
	proofJSON, err := json.Marshal(proof)
	if err != nil {
		return fmt.Errorf("marshal proof: %w", err)
	}

	publicJSON, err := json.Marshal([]string{
		publicInputs.CampaignMax,
		publicInputs.Commitment,
	})
	if err != nil {
		return fmt.Errorf("marshal public inputs: %w", err)
	}

	return v.Verify(ctx, publicJSON, proofJSON)
}
