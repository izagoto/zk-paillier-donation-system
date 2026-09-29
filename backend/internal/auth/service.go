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

func (s *Service) Register(
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

	_, err := s.repository.FindByEmail(ctx, email)
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
		"donor",
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

	user, err := s.repository.FindByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := CheckPassword(password, user.PasswordHash); err != nil {
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
