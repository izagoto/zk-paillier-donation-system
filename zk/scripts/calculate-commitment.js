const circomlibjs = require("circomlibjs");

async function main() {
    const poseidon = await circomlibjs.buildPoseidon();

    const amount = 100000n;
    const secret = 123456789n;

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
