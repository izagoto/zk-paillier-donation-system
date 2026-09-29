package donation

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Donation struct {
	ID              uuid.UUID
	CampaignID      uuid.UUID
	DonorID         uuid.UUID
	Commitment      string
	EncryptedAmount string
	ZKProof         string
	TxHash          string
	Status          string
	CreatedAt       time.Time
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
	campaignID uuid.UUID,
	donorID uuid.UUID,
	commitment string,
	encryptedAmount string,
) (*Donation, error) {
	donation := &Donation{
		ID: uuid.New(),
	}

	err := r.db.QueryRow(
		ctx,
		`
		INSERT INTO donations (
			id,
			campaign_id,
			donor_id,
			commitment,
			encrypted_amount,
			status
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING
			id,
			campaign_id,
			donor_id,
			commitment,
			encrypted_amount,
			zk_proof,
			tx_hash,
			status,
			created_at
		`,
		donation.ID,
		campaignID,
		donorID,
		commitment,
		encryptedAmount,
		"pending",
	).Scan(
		&donation.ID,
		&donation.CampaignID,
		&donation.DonorID,
		&donation.Commitment,
		&donation.EncryptedAmount,
		&donation.ZKProof,
		&donation.TxHash,
		&donation.Status,
		&donation.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return donation, nil
}

func (r *Repository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*Donation, error) {
	donation := &Donation{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			id,
			campaign_id,
			donor_id,
			commitment,
			encrypted_amount,
			zk_proof,
			tx_hash,
			status,
			created_at
		FROM donations
		WHERE id = $1
		`,
		id,
	).Scan(
		&donation.ID,
		&donation.CampaignID,
		&donation.DonorID,
		&donation.Commitment,
		&donation.EncryptedAmount,
		&donation.ZKProof,
		&donation.TxHash,
		&donation.Status,
		&donation.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return donation, nil
}

func (r *Repository) FindByCampaignID(
	ctx context.Context,
	campaignID uuid.UUID,
) ([]Donation, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			campaign_id,
			donor_id,
			commitment,
			encrypted_amount,
			zk_proof,
			tx_hash,
			status,
			created_at
		FROM donations
		WHERE campaign_id = $1
		ORDER BY created_at DESC
		`,
		campaignID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	donations := make([]Donation, 0)

	for rows.Next() {
		var donation Donation

		err := rows.Scan(
			&donation.ID,
			&donation.CampaignID,
			&donation.DonorID,
			&donation.Commitment,
			&donation.EncryptedAmount,
			&donation.ZKProof,
			&donation.TxHash,
			&donation.Status,
			&donation.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		donations = append(donations, donation)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return donations, nil
}
