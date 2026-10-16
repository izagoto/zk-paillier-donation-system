import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();

  const verifier = await ethers.deployContract("Groth16Verifier");

  await verifier.waitForDeployment();

  const verifierAddress = await verifier.getAddress();

  console.log("Groth16Verifier deployed to:");
  console.log(verifierAddress);

  const registry = await ethers.deployContract("DonationRegistry", [
    verifierAddress,
  ]);

  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();

  console.log("DonationRegistry deployed to:");
  console.log(registryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
