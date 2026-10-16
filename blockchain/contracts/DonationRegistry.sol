// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[2] calldata pubSignals
    ) external view returns (bool);
}

contract DonationRegistry {
    struct Donation {
        bytes32 campaignId;
        bytes32 commitment;
        bytes encryptedAmount;
        bytes zkProof;
        address submitter;
        uint256 timestamp;
    }

    address public immutable owner;
    IGroth16Verifier public immutable verifier;

    Donation[] private donations;

    mapping(bytes32 => uint256) public campaignMaxDonation;

    event CampaignMaxDonationUpdated(
        bytes32 indexed campaignId,
        uint256 maxDonation
    );

    event DonationRecorded(
        uint256 indexed donationId,
        bytes32 indexed campaignId,
        bytes32 commitment,
        address indexed submitter,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(address verifierAddress) {
        require(verifierAddress != address(0), "invalid verifier");

        owner = msg.sender;
        verifier = IGroth16Verifier(verifierAddress);
    }

    function setCampaignMaxDonation(
        bytes32 campaignId,
        uint256 maxDonation
    ) external onlyOwner {
        require(campaignId != bytes32(0), "invalid campaign");
        require(maxDonation > 0, "invalid max donation");

        campaignMaxDonation[campaignId] = maxDonation;

        emit CampaignMaxDonationUpdated(
            campaignId,
            maxDonation
        );
    }

    function recordDonation(
        bytes32 campaignId,
        bytes32 commitment,
        bytes calldata encryptedAmount,
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[2] calldata pubSignals
    ) external returns (uint256 donationId) {
        uint256 campaignMax = campaignMaxDonation[campaignId];

        require(campaignMax > 0, "campaign not registered");

        require(
            pubSignals[0] == campaignMax,
            "invalid campaign max"
        );

        require(
            pubSignals[1] == uint256(commitment),
            "invalid commitment"
        );

        require(
            verifier.verifyProof(
                pA,
                pB,
                pC,
                pubSignals
            ),
            "invalid zk proof"
        );

        donationId = donations.length;

        bytes memory encodedProof = abi.encode(
            pA,
            pB,
            pC,
            pubSignals
        );

        donations.push(
            Donation({
                campaignId: campaignId,
                commitment: commitment,
                encryptedAmount: encryptedAmount,
                zkProof: encodedProof,
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
        require(
            donationId < donations.length,
            "donation not found"
        );

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

    function getDonationCount()
        external
        view
        returns (uint256)
    {
        return donations.length;
    }
}