const circomlibjs = require("circomlibjs");

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();

  const amountArg = process.argv[2];
  const secretArg = process.argv[3];

  if (!amountArg || !secretArg) {
    throw new Error("usage: node calculate-commitment.js <amount> <secret>");
  }

  const amount = BigInt(amountArg);
  const secret = BigInt(secretArg);

  if (amount <= 0n) {
    throw new Error("amount must be greater than 0");
  }

  if (secret < 0n) {
    throw new Error("secret must not be negative");
  }

  const hash = poseidon([amount, secret]);
  const commitment = poseidon.F.toString(hash);

  console.log("amount:", amount.toString());
  console.log("secret:", secret.toString());
  console.log("commitment:", commitment);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
