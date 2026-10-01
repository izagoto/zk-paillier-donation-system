package donation

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
	zkProof string,
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
				zk_proof,
				status
		)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending')
		RETURNING
			id,
			campaign_id,
			donor_id,
			commitment,
			encrypted_amount,
			COALESCE(zk_proof, ''),
			COALESCE(tx_hash, ''),
			status,
			created_at
		`,
		donation.ID,
		campaignID,
		donorID,
		commitment,
		encryptedAmount,
		zkProof,
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
			COALESCE(zk_proof, ''),
			COALESCE(tx_hash, ''),
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
			COALESCE(zk_proof, ''),
			COALESCE(tx_hash, ''),
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

func (r *Repository) UpsertAggregate(
	ctx context.Context,
	campaignID uuid.UUID,
	encryptedTotal string,
) error {
	_, err := r.db.Exec(
		ctx,
		`
		INSERT INTO campaign_aggregates (
			campaign_id,
			encrypted_total,
			updated_at
		)
		VALUES ($1, $2, NOW())
		ON CONFLICT (campaign_id)
		DO UPDATE SET
			encrypted_total = EXCLUDED.encrypted_total,
			updated_at = NOW()
		`,
		campaignID,
		encryptedTotal,
	)

	return err
}

func (r *Repository) FindAggregate(
	ctx context.Context,
	campaignID uuid.UUID,
) (string, error) {
	var encryptedTotal string

	err := r.db.QueryRow(
		ctx,
		`
		SELECT encrypted_total
		FROM campaign_aggregates
		WHERE campaign_id = $1
		`,
		campaignID,
	).Scan(&encryptedTotal)

	if err != nil {
		return "", err
	}

	return encryptedTotal, nil
}

func (r *Repository) UpdateStatus(
	ctx context.Context,
	donationID uuid.UUID,
	status string,
) error {
	_, err := r.db.Exec(
		ctx,
		`
		UPDATE donations
		SET status = $1
		WHERE id = $2
		`,
		status,
		donationID,
	)

	return err
}

func (r *Repository) UpdateTxHash(
	ctx context.Context,
	donationID uuid.UUID,
	txHash string,
) error {
	_, err := r.db.Exec(
		ctx,
		`
        UPDATE donations
        SET tx_hash = $1
        WHERE id = $2
        `,
		txHash,
		donationID,
	)

	return err
}

func (r *Repository) FindConfirmedByCampaignID(
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
			COALESCE(zk_proof, ''),
			COALESCE(tx_hash, ''),
			status,
			created_at
		FROM donations
		WHERE campaign_id = $1
		  AND status = 'confirmed'
		ORDER BY created_at DESC
		`,
		campaignID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var donations []Donation

	for rows.Next() {
		var donation Donation

		if err := rows.Scan(
			&donation.ID,
			&donation.CampaignID,
			&donation.DonorID,
			&donation.Commitment,
			&donation.EncryptedAmount,
			&donation.ZKProof,
			&donation.TxHash,
			&donation.Status,
			&donation.CreatedAt,
		); err != nil {
			return nil, err
		}

		donations = append(donations, donation)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return donations, nil
}

func (r *Repository) UpdateAggregate(
	ctx context.Context,
	campaignID uuid.UUID,
	update func(current string) (string, error),
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Lock the campaign row to serialize aggregate updates
	// for the same campaign.
	var campaignExists bool

	err = tx.QueryRow(
		ctx,
		`
		SELECT EXISTS (
			SELECT 1
			FROM campaigns
			WHERE id = $1
		)
		`,
		campaignID,
	).Scan(&campaignExists)
	if err != nil {
		return err
	}

	if !campaignExists {
		return errors.New("campaign not found")
	}

	_, err = tx.Exec(
		ctx,
		`
		SELECT id
		FROM campaigns
		WHERE id = $1
		FOR UPDATE
		`,
		campaignID,
	)
	if err != nil {
		return err
	}

	var encryptedTotal string

	err = tx.QueryRow(
		ctx,
		`
		SELECT encrypted_total
		FROM campaign_aggregates
		WHERE campaign_id = $1
		FOR UPDATE
		`,
		campaignID,
	).Scan(&encryptedTotal)

	if err != nil {
		if err == pgx.ErrNoRows {
			encryptedTotal, err = update("")
			if err != nil {
				return err
			}

			_, err = tx.Exec(
				ctx,
				`
				INSERT INTO campaign_aggregates (
					campaign_id,
					encrypted_total,
					updated_at
				)
				VALUES ($1, $2, NOW())
				`,
				campaignID,
				encryptedTotal,
			)
			if err != nil {
				return err
			}

			return tx.Commit(ctx)
		}

		return err
	}

	encryptedTotal, err = update(encryptedTotal)
	if err != nil {
		return err
	}

	_, err = tx.Exec(
		ctx,
		`
		UPDATE campaign_aggregates
		SET encrypted_total = $1,
		    updated_at = NOW()
		WHERE campaign_id = $2
		`,
		encryptedTotal,
		campaignID,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
