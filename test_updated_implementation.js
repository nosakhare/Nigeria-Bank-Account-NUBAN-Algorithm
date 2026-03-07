// Test the updated implementation directly
const nubanUtil = require('./routes/nuban_util.js');

console.log("=".repeat(80));
console.log("Testing Updated NUBAN Implementation");
console.log("Based on 03balogun's algorithm with CBN Revised Standards (2020)");
console.log("=".repeat(80));

// Test cases
const testCases = [
  { account: "4000675874", expectedBanks: ["MONIEPOINT MICROFINANCE BANK", "FIDELITY BANK", "GUARANTY TRUST BANK"] },
  { account: "5822207333", expectedBanks: ["MONIEPOINT MICROFINANCE BANK", "FIDELITY BANK", "GUARANTY TRUST BANK"] },
  { account: "2182813377", expectedBanks: ["ACCESS BANK", "FIRST BANK OF NIGERIA", "UNITED BANK FOR AFRICA"] },
  { account: "1100000121", expectedBanks: ["PROVIDUS BANK", "STANDARD CHARTERED BANK", "WEMA BANK", "ZENITH BANK"] },
  { account: "0088116788", expectedBanks: ["CITIBANK NIGERIA", "STANBIC IBTC BANK", "STERLING BANK", "SUNTRUST BANK"] }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: Account ${testCase.account}`);
  console.log("-".repeat(80));

  // Create mock request/response objects
  const req = { params: { account: testCase.account } };
  const matchedBanks = [];

  const res = {
    send: (response) => {
      if (response.nubanMatches) {
        response.nubanMatches.forEach(bank => matchedBanks.push(bank));
      }
      if (response.phoneMatches) {
        response.phoneMatches.forEach(bank => matchedBanks.push(bank));
      }
    }
  };

  // Call the function
  nubanUtil.getAccountBanks(req, res, () => {});

  console.log(`Found ${matchedBanks.length} matching bank(s):`);
  matchedBanks.forEach(bank => {
    const isExpected = testCase.expectedBanks.includes(bank.name);
    const marker = isExpected ? "✓" : "🆕";
    console.log(`  ${marker} ${bank.name.padEnd(35)} (Code: ${bank.code})`);
  });

  // Check if we found the expected banks
  const foundExpected = testCase.expectedBanks.filter(expected =>
    matchedBanks.some(bank => bank.name === expected)
  );

  if (foundExpected.length === testCase.expectedBanks.length) {
    console.log(`✅ All expected banks found!`);
  } else {
    const missing = testCase.expectedBanks.filter(expected =>
      !matchedBanks.some(bank => bank.name === expected)
    );
    console.log(`⚠️  Missing expected banks: ${missing.join(", ")}`);
  }
});

console.log("\n" + "=".repeat(80));
console.log("Testing Account Generation Endpoint");
console.log("=".repeat(80));

// Test account generation with different bank codes
const generationTests = [
  { bankCode: "058", serialNumber: "1656322", bankName: "GUARANTY TRUST BANK" },
  { bankCode: "50515", serialNumber: "1656322", bankName: "MONIEPOINT MFB" },
  { bankCode: "999991", serialNumber: "1656322", bankName: "PALMPAY" }
];

generationTests.forEach((test, index) => {
  console.log(`\nGeneration Test ${index + 1}: ${test.bankName} (${test.bankCode})`);
  console.log("-".repeat(80));

  const req = {
    params: { bank: test.bankCode },
    body: { serialNumber: test.serialNumber }
  };

  let generatedAccount = null;
  const res = {
    send: (account) => {
      generatedAccount = account;
    }
  };

  const next = (error) => {
    if (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  };

  nubanUtil.createAccountWithSerial(req, res, next);

  if (generatedAccount) {
    console.log(`Serial Number: ${generatedAccount.serialNumber}`);
    console.log(`Generated NUBAN: ${generatedAccount.nuban}`);
    console.log(`Bank: ${generatedAccount.bank.name}`);
    console.log(`✅ Successfully generated account for ${test.bankName}`);
  }
});

console.log("\n" + "=".repeat(80));
console.log("All tests completed!");
console.log("=".repeat(80));
