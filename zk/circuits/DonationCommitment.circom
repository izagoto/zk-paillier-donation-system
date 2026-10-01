pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template DonationCommitment() {
    signal input amount;
    signal input secret;
    signal input commitment;

    component hash = Poseidon(2);

    hash.inputs[0] <== amount;
    hash.inputs[1] <== secret;

    hash.out === commitment;
}

component main {public [commitment]} = DonationCommitment();
