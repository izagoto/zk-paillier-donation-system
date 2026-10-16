package zk

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"runtime"
)

type GenerateResult struct {
	Amount        string `json:"amount"`
	Secret        string `json:"secret"`
	Commitment    string `json:"commitment"`
	CampaignMax   string `json:"campaign_max"`
	Proof         Proof  `json:"proof"`
	PublicSignals []string `json:"public_signals"`
}

type Prover struct {
	NodePath         string
	ScriptPath       string
	WorkingDirectory string
}

func NewProver() (*Prover, error) {
	nodePath, err := exec.LookPath("node")
	if err != nil {
		return nil, fmt.Errorf("node not found: %w", err)
	}

	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		return nil, fmt.Errorf("cannot determine prover source path")
	}

	projectRoot := filepath.Clean(
		filepath.Join(
			filepath.Dir(sourceFile),
			"../../..",
		),
	)

	return &Prover{
		NodePath: nodePath,
		ScriptPath: filepath.Join(
			projectRoot,
			"zk",
			"scripts",
			"generate-donation-proof.js",
		),
		WorkingDirectory: projectRoot,
	}, nil
}

func (p *Prover) Generate(
	ctx context.Context,
	amount string,
	campaignMax string,
) (*GenerateResult, error) {
	cmd := exec.CommandContext(
		ctx,
		p.NodePath,
		p.ScriptPath,
		amount,
		campaignMax,
	)
	cmd.Dir = p.WorkingDirectory

	output, err := cmd.Output()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return nil, fmt.Errorf(
				"generate proof failed: %s",
				string(exitErr.Stderr),
			)
		}

		return nil, fmt.Errorf("generate proof failed: %w", err)
	}

	var result GenerateResult
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("parse proof result: %w", err)
	}

	return &result, nil
}
