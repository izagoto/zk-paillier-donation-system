package donation

import (
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
)

var allowedTransitions = map[string]map[string]bool{
	"pending": {
		"confirmed": true,
		"failed":    true,
	},
	"failed": {
		"pending": true,
	},
}

func CanTransitionStatus(from, to string) bool {
	if from == to {
		return true
	}
	next, ok := allowedTransitions[from]
	if !ok {
		return false
	}
	return next[to]
}

func ValidateStatusTransition(from, to string) error {
	if CanTransitionStatus(from, to) {
		return nil
	}
	return ErrInvalidDonationStatus
}

func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}
