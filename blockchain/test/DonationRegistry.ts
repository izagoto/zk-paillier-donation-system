import { expect } from "chai";
import fs from "node:fs";
import { network } from "hardhat";

describe("DonationRegistry", function () {
  async function deployRegistry() {
    const { ethers } = await network.getOrCreate();

    const verifier = await ethers.deployContract("Groth16Verifier");
    await verifier.waitForDeployment();

    const verifierAddress = await verifier.getAddress();

    const registry = await ethers.deployContract("DonationRegistry", [
      verifierAddress,
    ]);
    await registry.waitForDeployment();

    return { registry, verifier };
  }

  it("should record a donation with a valid Groth16 proof", async function () {
    const { ethers } = await network.getOrCreate();
    const { registry } = await deployRegistry();

    const proof = JSON.parse(
      fs.readFileSync("../zk/build/donation-proof.json", "utf8"),
    );

    const publicSignals = JSON.parse(
      fs.readFileSync("../zk/build/donation-public.json", "utf8"),
    );

    const campaignId = ethers.encodeBytes32String("campaign-1");

    const commitment = ethers.zeroPadValue(
      ethers.toBeHex(BigInt(publicSignals[1])),
      32,
    );

    const encryptedAmount = ethers.hexlify(
      ethers.toUtf8Bytes("encrypted-paillier-value"),
    );

    const campaignMax = BigInt(publicSignals[0]);

    const pA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];

    const pB = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ];

    const pC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    const pubSignals = [BigInt(publicSignals[0]), BigInt(publicSignals[1])];

    await registry.setCampaignMaxDonation(campaignId, campaignMax);

    await registry.recordDonation(
      campaignId,
      commitment,
      encryptedAmount,
      pA,
      pB,
      pC,
      pubSignals,
    );

    expect(await registry.getDonationCount()).to.equal(1n);

    const donation = await registry.getDonation(0);

    expect(donation[0]).to.equal(campaignId);
    expect(donation[1]).to.equal(commitment);
    expect(donation[2]).to.equal(encryptedAmount);
  });

  it("should reject an invalid Groth16 proof", async function () {
    const { ethers } = await network.getOrCreate();
    const { registry } = await deployRegistry();

    const proof = JSON.parse(
      fs.readFileSync("../zk/build/donation-proof.json", "utf8"),
    );

    const publicSignals = JSON.parse(
      fs.readFileSync("../zk/build/donation-public.json", "utf8"),
    );

    const campaignId = ethers.encodeBytes32String("campaign-1");

    const commitment = ethers.zeroPadValue(
      ethers.toBeHex(BigInt(publicSignals[1])),
      32,
    );

    const encryptedAmount = ethers.hexlify(
      ethers.toUtf8Bytes("encrypted-paillier-value"),
    );

    const campaignMax = BigInt(publicSignals[0]);

    const pA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];

    const pB = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ];

    const pC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    const invalidPubSignals = [campaignMax, BigInt(publicSignals[1]) + 1n];

    await registry.setCampaignMaxDonation(campaignId, campaignMax);

    let reverted = false;

    try {
      await registry.recordDonation(
        campaignId,
        commitment,
        encryptedAmount,
        pA,
        pB,
        pC,
        invalidPubSignals,
      );
    } catch (error) {
      reverted = true;
      expect(String(error)).to.include("invalid commitment");
    }

    expect(reverted).to.equal(true);
  });
});
