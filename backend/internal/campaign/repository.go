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
	ImageURL     string
	Category     string
	Location     string
	CreatedBy    uuid.UUID
	CreatedAt    time.Time
}

const campaignSelectColumns = `
	id,
	title,
	description,
	target_amount,
	max_donation,
	status,
	COALESCE(image_url, ''),
	COALESCE(category, ''),
	COALESCE(location, ''),
	created_by,
	created_at
`

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
	id uuid.UUID,
	title string,
	description string,
	targetAmount string,
	maxDonation string,
	imageURL string,
	category string,
	location string,
	createdBy uuid.UUID,
) (*Campaign, error) {
	campaign := &Campaign{ID: id}

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
			image_url,
			category,
			location,
			created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING
		`+campaignSelectColumns,
		campaign.ID,
		title,
		description,
		targetAmount,
		maxDonation,
		"active",
		nullIfEmpty(imageURL),
		nullIfEmpty(category),
		nullIfEmpty(location),
		createdBy,
	).Scan(
		&campaign.ID,
		&campaign.Title,
		&campaign.Description,
		&campaign.TargetAmount,
		&campaign.MaxDonation,
		&campaign.Status,
		&campaign.ImageURL,
		&campaign.Category,
		&campaign.Location,
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
		`+campaignSelectColumns+`
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
			&campaign.ImageURL,
			&campaign.Category,
			&campaign.Location,
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
		`+campaignSelectColumns+`
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
		&campaign.ImageURL,
		&campaign.Category,
		&campaign.Location,
		&campaign.CreatedBy,
		&campaign.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return campaign, nil
}

func nullIfEmpty(value string) interface{} {
	if value == "" {
		return nil
	}
	return value
}

func (r *Repository) Update(
	ctx context.Context,
	id uuid.UUID,
	title string,
	description string,
	status string,
	imageURL string,
	category string,
	location string,
) (*Campaign, error) {
	campaign := &Campaign{}

	err := r.db.QueryRow(
		ctx,
		`
		UPDATE campaigns
		SET
			title = $2,
			description = $3,
			status = $4,
			image_url = $5,
			category = $6,
			location = $7
		WHERE id = $1
		RETURNING
		`+campaignSelectColumns,
		id,
		title,
		description,
		status,
		nullIfEmpty(imageURL),
		nullIfEmpty(category),
		nullIfEmpty(location),
	).Scan(
		&campaign.ID,
		&campaign.Title,
		&campaign.Description,
		&campaign.TargetAmount,
		&campaign.MaxDonation,
		&campaign.Status,
		&campaign.ImageURL,
		&campaign.Category,
		&campaign.Location,
		&campaign.CreatedBy,
		&campaign.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return campaign, nil
}
