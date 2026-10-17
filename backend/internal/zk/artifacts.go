package zk

import (
	"os"
)

// ArtifactsPresent reports whether zk/build verification key exists (not in git; CI skips).
func ArtifactsPresent() bool {
	verifier, err := NewVerifier()
	if err != nil {
		return false
	}
	_, err = os.Stat(verifier.VerificationKey)
	return err == nil
}
