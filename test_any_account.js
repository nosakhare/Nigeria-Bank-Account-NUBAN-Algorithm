// Test any account number with both implementations
const banks = [
  { name: "ACCESS BANK", code: "044" },
  { name: "CITIBANK", code: "023" },
  { name: "DIAMOND BANK", code: "063" },
  { name: "ECOBANK NIGERIA", code: "050" },
  { name: "FIDELITY BANK", code: "070" },
  { name: "FIRST BANK OF NIGERIA", code: "011" },
  { name: "FIRST CITY MONUMENT BANK", code: "214" },
  { name: "GUARANTY TRUST BANK", code: "058" },
  { name: "HERITAGE BANK", code: "030" },
  { name: "JAIZ BANK", code: "301" },
  { name: "KEYSTONE BANK", code: "082" },
  { name: "PROVIDUS BANK", code: "101" },
  { name: "SKYE BANK", code: "076" },
  { name: "STANBIC IBTC BANK", code: "221" },
  { name: "STANDARD CHARTERED BANK", code: "068" },
  { name: "STERLING BANK", code: "232" },
  { name: "SUNTRUST", code: "100" },
  { name: "UNION BANK OF NIGERIA", code: "032" },
  { name: "UNITED BANK FOR AFRICA", code: "033" },
  { name: "UNITY BANK", code: "215" },
  { name: "WEMA BANK", code: "035" },
  { name: "ZENITH BANK", code: "057" },
  // Add microfinance banks
  { name: "MONIEPOINT MFB", code: "50515" },
  { name: "VFD MICROFINANCE BANK", code: "566" },
  { name: "SPARKLE MICROFINANCE BANK", code: "51310" },
  { name: "RUBIES MFB", code: "125" },
  { name: "KUDA BANK", code: "50211" },
  { name: "OPAY", code: "305" },
  { name: "PALMPAY", code: "999991" }
];

// Current implementation (3-digit only)
const seed = "373373373373";

const generateCheckDigitOld = (serialNumber, bankCode) => {
  serialNumber = serialNumber.padStart(9, "0");
  let cipher = bankCode + serialNumber;

  if (cipher.length !== 12) {
    return null; // Cannot validate
  }

  let sum = 0;
  cipher.split("").forEach((item, index) => {
    sum += item * seed[index];
  });

  sum %= 10;
  let checkDigit = 10 - sum;
  checkDigit = checkDigit == 10 ? 0 : checkDigit;

  return checkDigit;
};

// 03balogun implementation
const bankCodeWeights = [3, 7, 3, 3, 7, 3];
const serialNumberWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3];

const calculateWeightedSum = (value, weights) => {
  if (value.length !== weights.length) {
    return null;
  }

  return value.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
}

const generateCheckDigitNew = (serialNumber, bankCode) => {
  serialNumber = serialNumber.padStart(9, "0");

  let paddedBankCode = bankCode.replace(/\D/g, '');

  // Handle different bank code lengths
  if (paddedBankCode.length === 3) {
    paddedBankCode = `000${paddedBankCode}`;
  } else if (paddedBankCode.length === 5) {
    paddedBankCode = `9${paddedBankCode}`;
  } else if (paddedBankCode.length === 6) {
    // Use as-is
  } else {
    return null; // Invalid length
  }

  const result = calculateWeightedSum(paddedBankCode, bankCodeWeights) +
                 calculateWeightedSum(serialNumber, serialNumberWeights);

  if (result === null) return null;

  const subtractionResult = 10 - (result % 10);
  return subtractionResult === 10 ? 0 : subtractionResult;
}

const testAccount = (accountNumber) => {
  if (accountNumber.length !== 10) {
    console.log("Error: Account number must be 10 digits");
    return;
  }

  const serialNumber = accountNumber.substring(0, 9);
  const actualCheckDigit = accountNumber[9];

  console.log("\n" + "=".repeat(80));
  console.log(`Testing Account Number: ${accountNumber}`);
  console.log("=".repeat(80));
  console.log(`Serial Number: ${serialNumber}`);
  console.log(`Check Digit: ${actualCheckDigit}`);
  console.log("=".repeat(80));

  let oldMatches = [];
  let newMatches = [];

  banks.forEach((bank) => {
    // Test with old implementation
    if (bank.code.length === 3) {
      const checkDigit = generateCheckDigitOld(serialNumber, bank.code);
      if (checkDigit !== null && checkDigit == actualCheckDigit) {
        oldMatches.push(bank);
      }
    }

    // Test with new implementation
    const checkDigit = generateCheckDigitNew(serialNumber, bank.code);
    if (checkDigit !== null && checkDigit == actualCheckDigit) {
      newMatches.push(bank);
    }
  });

  console.log("\n📊 CURRENT IMPLEMENTATION (3-digit codes only):");
  console.log("-".repeat(80));
  if (oldMatches.length > 0) {
    oldMatches.forEach(bank => {
      console.log(`  ✓ ${bank.name.padEnd(35)} (Code: ${bank.code})`);
    });
    console.log(`\n  Total: ${oldMatches.length} bank(s)`);
  } else {
    console.log("  ❌ No matches found");
  }

  console.log("\n📊 03BALOGUN IMPLEMENTATION (3, 5, 6-digit codes):");
  console.log("-".repeat(80));
  if (newMatches.length > 0) {
    newMatches.forEach(bank => {
      const isNew = !oldMatches.find(b => b.code === bank.code);
      const marker = isNew ? "🆕" : "✓";
      console.log(`  ${marker} ${bank.name.padEnd(35)} (Code: ${bank.code})`);
    });
    console.log(`\n  Total: ${newMatches.length} bank(s)`);

    const additionalBanks = newMatches.filter(b => !oldMatches.find(ob => ob.code === b.code));
    if (additionalBanks.length > 0) {
      console.log(`  🆕 Found ${additionalBanks.length} additional bank(s) not detected by old implementation`);
    }
  } else {
    console.log("  ❌ No matches found");
  }

  console.log("\n" + "=".repeat(80));
};

// Get account number from command line or use default
const accountNumber = process.argv[2] || "1100000121";
testAccount(accountNumber);
