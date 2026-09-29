package auth

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	Role         string
}

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(
	ctx context.Context,
	email string,
	passwordHash string,
	role string,
) (*User, error) {
	user := &User{
		ID: uuid.New(),
	}

	err := r.db.QueryRow(
		ctx,
		`
		INSERT INTO users (id, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, password_hash, role
		`,
		user.ID,
		email,
		passwordHash,
		role,
	).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) FindByEmail(
	ctx context.Context,
	email string,
) (*User, error) {
	user := &User{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT id, email, password_hash, role
		FROM users
		WHERE email = $1
		`,
		email,
	).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*User, error) {
	user := &User{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT id, email, password_hash, role
		FROM users
		WHERE id = $1
		`,
		id,
	).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
