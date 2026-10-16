const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const circomlibjs = require("circomlibjs");

async function main() {
  const amountArg = process.argv[2];
  const campaignMaxArg = process.argv[3];
  const secretArg = process.argv[4];

  if (!amountArg || !campaignMaxArg) {
    throw new Error(
      "usage: node generate-donation-proof.js <amount> <campaign_max> [secret]",
    );
  }

  const amount = BigInt(amountArg);
  const campaignMax = BigInt(campaignMaxArg);

  if (amount <= 0n) {
    throw new Error("amount must be greater than 0");
  }

  if (amount > campaignMax) {
    throw new Error("amount exceeds campaign_max");
  }

  let secret;
  if (secretArg) {
    secret = BigInt(secretArg);
  } else {
    secret = BigInt(
      "0x" +
        require("crypto")
          .randomBytes(31)
          .toString("hex"),
    );
  }

  const poseidon = await circomlibjs.buildPoseidon();
  const hash = poseidon([amount, secret]);
  const commitment = poseidon.F.toString(hash);

  const buildDir = path.join(__dirname, "..", "build");
  const wasmPath = path.join(buildDir, "DonationProof_js", "DonationProof.wasm");
  const zkeyPath = path.join(buildDir, "DonationProof_final.zkey");

  const input = {
    amount: amount.toString(),
    secret: secret.toString(),
    campaign_max: campaignMax.toString(),
    commitment,
  };

  const tempDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "zk-proof-"));
  const inputPath = path.join(tempDir, "input.json");
  const proofPath = path.join(tempDir, "proof.json");
  const publicPath = path.join(tempDir, "public.json");

  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

  execSync(
    `npx snarkjs groth16 fullprove "${inputPath}" "${wasmPath}" "${zkeyPath}" "${proofPath}" "${publicPath}"`,
    {
      cwd: path.join(__dirname, "..", ".."),
      stdio: "pipe",
    },
  );

  const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

  const result = {
    amount: amount.toString(),
    secret: secret.toString(),
    commitment,
    campaign_max: campaignMax.toString(),
    proof,
    public_signals: publicSignals,
  };

  process.stdout.write(JSON.stringify(result));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
