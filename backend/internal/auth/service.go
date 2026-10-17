package auth

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var (
	ErrEmailRequired      = errors.New("email is required")
	ErrPasswordRequired   = errors.New("password is required")
	ErrEmailExists        = errors.New("email already exists")
	// Pesan generik — jangan bedakan email tidak ada vs password salah.
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type Service struct {
	repository *UserRepository
}

func NewService(repository *UserRepository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) CountUsers(ctx context.Context) (int64, error) {
	return s.repository.Count(ctx)
}

func (s *Service) Register(
	ctx context.Context,
	email string,
	password string,
	role string,
) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return nil, ErrEmailRequired
	}

	if password == "" {
		return nil, ErrPasswordRequired
	}

	if err := ValidatePasswordPolicy(password); err != nil {
		return nil, err
	}

	normalizedRole, err := NormalizeRole(role)
	if err != nil {
		return nil, err
	}

	_, err = s.repository.FindByEmail(ctx, email)
	if err == nil {
		return nil, ErrEmailExists
	}

	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return nil, err
	}

	return s.repository.Create(
		ctx,
		email,
		passwordHash,
		normalizedRole,
	)
}

func (s *Service) Login(
	ctx context.Context,
	email string,
	password string,
) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return nil, ErrEmailRequired
	}

	if password == "" {
		return nil, ErrPasswordRequired
	}

	if len(password) > MaxPasswordBytes {
		return nil, ErrInvalidCredentials
	}

	user, err := s.repository.FindByEmail(ctx, email)
	hashToCheck := dummyPasswordHash
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}
		user = nil
	} else {
		hashToCheck = user.PasswordHash
	}

	if err := CheckPassword(password, hashToCheck); err != nil {
		return nil, ErrInvalidCredentials
	}

	if user == nil {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

func (s *Service) GetUserByID(
	ctx context.Context,
	id uuid.UUID,
) (*User, error) {
	return s.repository.FindByID(ctx, id)
}
