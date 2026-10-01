// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DonationRegistry {
    struct Donation {
        bytes32 campaignId;
        bytes32 commitment;
        bytes encryptedAmount;
        bytes zkProof;
        address submitter;
        uint256 timestamp;
    }

    Donation[] private donations;

    event DonationRecorded(
        uint256 indexed donationId,
        bytes32 indexed campaignId,
        bytes32 commitment,
        address indexed submitter,
        uint256 timestamp
    );

    function recordDonation(
        bytes32 campaignId,
        bytes32 commitment,
        bytes calldata encryptedAmount,
        bytes calldata zkProof
    ) external returns (uint256 donationId) {
        donationId = donations.length;

        donations.push(
            Donation({
                campaignId: campaignId,
                commitment: commitment,
                encryptedAmount: encryptedAmount,
                zkProof: zkProof,
                submitter: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit DonationRecorded(
            donationId,
            campaignId,
            commitment,
            msg.sender,
            block.timestamp
        );
    }

    function getDonation(
        uint256 donationId
    )
        external
        view
        returns (
            bytes32 campaignId,
            bytes32 commitment,
            bytes memory encryptedAmount,
            bytes memory zkProof,
            address submitter,
            uint256 timestamp
        )
    {
        require(donationId < donations.length, "donation not found");

        Donation storage donation = donations[donationId];

        return (
            donation.campaignId,
            donation.commitment,
            donation.encryptedAmount,
            donation.zkProof,
            donation.submitter,
            donation.timestamp
        );
    }

    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
}