package blockchain

type DonationPayload struct {
	CampaignID      string
	Commitment      string
	EncryptedAmount string
	ZKProof         string
}

func NewDonationPayload(
	campaignID string,
	commitment string,
	encryptedAmount string,
	zkProof string,
) DonationPayload {
	return DonationPayload{
		CampaignID:      campaignID,
		Commitment:      commitment,
		EncryptedAmount: encryptedAmount,
		ZKProof:         zkProof,
	}
}