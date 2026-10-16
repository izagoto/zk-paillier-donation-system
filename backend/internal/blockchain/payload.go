package blockchain

type DonationPayload struct {
	CampaignID      string
	CampaignMax     string
	Commitment      string
	EncryptedAmount string
	ZKProof         string
}

func NewDonationPayload(
	campaignID string,
	campaignMax string,
	commitment string,
	encryptedAmount string,
	zkProof string,
) DonationPayload {
	return DonationPayload{
		CampaignID:      campaignID,
		CampaignMax:     campaignMax,
		Commitment:      commitment,
		EncryptedAmount: encryptedAmount,
		ZKProof:         zkProof,
	}
}
