package campaign

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Campaign struct {
	ID           uuid.UUID
	Title        string
	Description  string
	TargetAmount string
	MaxDonation  string
	Status       string
	CreatedBy    uuid.UUID
	CreatedAt    time.Time
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(
	ctx context.Context,
	title string,
	description string,
	targetAmount string,
	maxDonation string,
	createdBy uuid.UUID,
) (*Campaign, error) {
	campaign := &Campaign{
		ID: uuid.New(),
	}

	err := r.db.QueryRow(
		ctx,
		`
		INSERT INTO campaigns (
			id,
			title,
			description,
			target_amount,
			max_donation,
			status,
			created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING
			id,
			title,
			description,
			target_amount,
			max_donation,
			status,
			created_by,
			created_at
		`,
		campaign.ID,
		title,
		description,
		targetAmount,
		maxDonation,
		"active",
		createdBy,
	).Scan(
		&campaign.ID,
		&campaign.Title,
		&campaign.Description,
		&campaign.TargetAmount,
		&campaign.MaxDonation,
		&campaign.Status,
		&campaign.CreatedBy,
		&campaign.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return campaign, nil
}

func (r *Repository) FindAll(
	ctx context.Context,
) ([]Campaign, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			title,
			description,
			target_amount,
			max_donation,
			status,
			created_by,
			created_at
		FROM campaigns
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	campaigns := make([]Campaign, 0)

	for rows.Next() {
		var campaign Campaign

		err := rows.Scan(
			&campaign.ID,
			&campaign.Title,
			&campaign.Description,
			&campaign.TargetAmount,
			&campaign.MaxDonation,
			&campaign.Status,
			&campaign.CreatedBy,
			&campaign.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		campaigns = append(campaigns, campaign)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return campaigns, nil
}

func (r *Repository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*Campaign, error) {
	campaign := &Campaign{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			id,
			title,
			description,
			target_amount,
			max_donation,
			status,
			created_by,
			created_at
		FROM campaigns
		WHERE id = $1
		`,
		id,
	).Scan(
		&campaign.ID,
		&campaign.Title,
		&campaign.Description,
		&campaign.TargetAmount,
		&campaign.MaxDonation,
		&campaign.Status,
		&campaign.CreatedBy,
		&campaign.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return campaign, nil
}
