import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { network } from "hardhat";

const REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

type DonationData = {
  campaign_id: string;
  amount: string;
  commitment: string;
};

async function main() {
  const { ethers } = await network.getOrCreate();

  const dataPath = resolve("test-data/donation.json");
  const data = JSON.parse(readFileSync(dataPath, "utf-8")) as DonationData;

  const registry = await ethers.getContractAt(
    "DonationRegistry",
    REGISTRY_ADDRESS,
  );

  const campaignId = ethers.id(data.campaign_id);

  const commitment = ethers.toBeHex(BigInt(data.commitment), 32);

  /*
   * Temporary test values.
   *
   * Paillier ciphertext and Groth16 proof
   * will be supplied by the backend integration later.
   */
  const encryptedAmount = ethers.toUtf8Bytes(
    `paillier-ciphertext-for-${data.amount}`,
  );

  const zkProof = ethers.toUtf8Bytes("groth16-proof-test");

  const tx = await registry.recordDonation(
    campaignId,
    commitment,
    encryptedAmount,
    zkProof,
  );

  console.log("Transaction submitted:");
  console.log(tx.hash);

  const receipt = await tx.wait();

  console.log("Transaction confirmed in block:");
  console.log(receipt?.blockNumber);

  const count = await registry.getDonationCount();

  console.log("Donation count:");
  console.log(count.toString());

  const donation = await registry.getDonation(count - 1n);

  console.log("Stored donation:");
  console.log({
    campaignId: donation[0],
    commitment: donation[1],
    encryptedAmount: ethers.toUtf8String(donation[2]),
    zkProof: ethers.toUtf8String(donation[3]),
    submitter: donation[4],
    timestamp: donation[5].toString(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
