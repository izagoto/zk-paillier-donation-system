import { expect } from "chai";
import { network } from "hardhat";

describe("DonationRegistry", function () {
  async function deployRegistry() {
    const { ethers } = await network.getOrCreate();

    const registry = await ethers.deployContract("DonationRegistry");
    await registry.waitForDeployment();

    return registry;
  }

  it("should record a donation", async function () {
    const { ethers } = await network.getOrCreate();
    const registry = await deployRegistry();

    const campaignId = ethers.encodeBytes32String("campaign-1");

    const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment-1"));

    const encryptedAmount = ethers.hexlify(
      ethers.toUtf8Bytes("encrypted-paillier-value"),
    );

    const zkProof = ethers.hexlify(ethers.toUtf8Bytes("groth16-proof"));

    await registry.recordDonation(
      campaignId,
      commitment,
      encryptedAmount,
      zkProof,
    );

    expect(await registry.getDonationCount()).to.equal(1n);

    const donation = await registry.getDonation(0);

    expect(donation[0]).to.equal(campaignId);
    expect(donation[1]).to.equal(commitment);
    expect(donation[2]).to.equal(encryptedAmount);
    expect(donation[3]).to.equal(zkProof);
  });
});
