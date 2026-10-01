pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template DonationValidity() {
    signal input amount;
    signal input campaign_max;

    signal output valid;

    component isPositive = GreaterThan(64);
    component isWithinLimit = LessEqThan(64);

    isPositive.in[0] <== amount;
    isPositive.in[1] <== 0;

    isWithinLimit.in[0] <== amount;
    isWithinLimit.in[1] <== campaign_max;

    valid <== isPositive.out * isWithinLimit.out;

    // Donation must satisfy both conditions.
    valid === 1;
}

component main {public [campaign_max]} = DonationValidity();
