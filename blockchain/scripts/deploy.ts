import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();

  const registry = await ethers.deployContract("DonationRegistry");

  await registry.waitForDeployment();

  console.log("DonationRegistry deployed to:");
  console.log(await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
