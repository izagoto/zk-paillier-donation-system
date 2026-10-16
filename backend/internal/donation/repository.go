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

func (r *Repository) FindByIdempotencyKey(
	ctx context.Context,
	idempotencyKey string,
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
		WHERE idempotency_key = $1
		`,
		idempotencyKey,
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

func (r *Repository) Create(
	ctx context.Context,
	campaignID uuid.UUID,
	donorID uuid.UUID,
	commitment string,
	encryptedAmount string,
	zkProof string,
	idempotencyKey string,
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
				idempotency_key,
				status
		)
		VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), 'pending')
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
		idempotencyKey,
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

func (r *Repository) FindByDonorID(
	ctx context.Context,
	donorID uuid.UUID,
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
		WHERE donor_id = $1
		ORDER BY created_at DESC
		`,
		donorID,
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

func (r *Repository) TransitionStatus(
	ctx context.Context,
	donationID uuid.UUID,
	fromStatus string,
	toStatus string,
) error {
	if err := ValidateStatusTransition(fromStatus, toStatus); err != nil {
		return err
	}

	if fromStatus == toStatus {
		return nil
	}

	tag, err := r.db.Exec(
		ctx,
		`
		UPDATE donations
		SET status = $3
		WHERE id = $1 AND status = $2
		`,
		donationID,
		fromStatus,
		toStatus,
	)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return ErrInvalidDonationStatus
	}

	return nil
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

type DonationVerification struct {
	ID            uuid.UUID
	CampaignID    uuid.UUID
	CampaignTitle string
	Status        string
	TxHash        string
	Commitment    string
	CreatedAt     time.Time
}

func (r *Repository) FindVerificationByID(
	ctx context.Context,
	id uuid.UUID,
) (*DonationVerification, error) {
	row := &DonationVerification{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			d.id,
			d.campaign_id,
			c.title,
			d.status,
			COALESCE(d.tx_hash, ''),
			d.commitment,
			d.created_at
		FROM donations d
		INNER JOIN campaigns c ON c.id = d.campaign_id
		WHERE d.id = $1
		`,
		id,
	).Scan(
		&row.ID,
		&row.CampaignID,
		&row.CampaignTitle,
		&row.Status,
		&row.TxHash,
		&row.Commitment,
		&row.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return row, nil
}

type DayDonationCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

func (r *Repository) CountConfirmedByDayForOrganizer(
	ctx context.Context,
	organizerID uuid.UUID,
	days int,
) ([]DayDonationCount, error) {
	if days < 1 {
		days = 7
	}
	if days > 90 {
		days = 90
	}

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			to_char(date_trunc('day', d.created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD'),
			COUNT(*)::int
		FROM donations d
		INNER JOIN campaigns c ON c.id = d.campaign_id
		WHERE c.created_by = $1
		  AND d.status = 'confirmed'
		  AND d.created_at >= NOW() - ($2::int * INTERVAL '1 day')
		GROUP BY 1
		ORDER BY 1
		`,
		organizerID,
		days,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]DayDonationCount, 0)

	for rows.Next() {
		var item DayDonationCount
		if err := rows.Scan(&item.Date, &item.Count); err != nil {
			return nil, err
		}
		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

type DonationStatusCounts struct {
	Pending   int
	Confirmed int
	Failed    int
}

func (r *Repository) CountDonationsByStatus(
	ctx context.Context,
) (*DonationStatusCounts, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT status, COUNT(*)::int
		FROM donations
		GROUP BY status
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := &DonationStatusCounts{}

	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		switch status {
		case "pending":
			counts.Pending = count
		case "confirmed":
			counts.Confirmed = count
		case "failed":
			counts.Failed = count
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return counts, nil
}

func (r *Repository) FindPending(
	ctx context.Context,
	limit int,
) ([]Donation, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

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
		WHERE status = 'pending'
		ORDER BY created_at ASC
		LIMIT $1
		`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]Donation, 0)

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
		result = append(result, donation)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

func (r *Repository) CountArchiveRows(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRow(
		ctx,
		`SELECT COUNT(*)::int FROM donations_duplicate_archive`,
	).Scan(&count)
	return count, err
}

type ArchiveRow struct {
	ID            uuid.UUID `json:"id"`
	CampaignID    uuid.UUID `json:"campaign_id"`
	DonorID       uuid.UUID `json:"donor_id"`
	Commitment    string    `json:"commitment"`
	Status        string    `json:"status"`
	ArchiveReason string    `json:"archive_reason"`
	ArchivedAt    time.Time `json:"archived_at"`
}

func (r *Repository) ListArchiveRows(
	ctx context.Context,
	limit int,
) ([]ArchiveRow, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			campaign_id,
			donor_id,
			commitment,
			status,
			archive_reason,
			archived_at
		FROM donations_duplicate_archive
		ORDER BY archived_at DESC
		LIMIT $1
		`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]ArchiveRow, 0)

	for rows.Next() {
		var row ArchiveRow
		if err := rows.Scan(
			&row.ID,
			&row.CampaignID,
			&row.DonorID,
			&row.Commitment,
			&row.Status,
			&row.ArchiveReason,
			&row.ArchivedAt,
		); err != nil {
			return nil, err
		}
		result = append(result, row)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
