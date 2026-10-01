pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template DonationProof() {
    // Private inputs
    signal input amount;
    signal input secret;

    // Public inputs
    signal input campaign_max;
    signal input commitment;

    // -------------------------
    // 1. Amount must be > 0
    // -------------------------
    component isPositive = GreaterThan(64);

    isPositive.in[0] <== amount;
    isPositive.in[1] <== 0;

    // -------------------------
    // 2. Amount must be <= campaign_max
    // -------------------------
    component isWithinLimit = LessEqThan(64);

    isWithinLimit.in[0] <== amount;
    isWithinLimit.in[1] <== campaign_max;

    // -------------------------
    // 3. Both conditions must hold
    // -------------------------
    isPositive.out * isWithinLimit.out === 1;

    // -------------------------
    // 4. Commitment = Poseidon(amount, secret)
    // -------------------------
    component hash = Poseidon(2);

    hash.inputs[0] <== amount;
    hash.inputs[1] <== secret;

    hash.out === commitment;
}

component main {public [campaign_max, commitment]} = DonationProof();
