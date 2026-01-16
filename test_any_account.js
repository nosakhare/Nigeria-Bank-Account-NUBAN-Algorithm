// Test any account number with both implementations
const banks = [
  // Commercial Banks (3-digit codes) - All use NUBAN
  { name: "ACCESS BANK", code: "044", usesNuban: true },
  { name: "CITIBANK", code: "023", usesNuban: true },
  { name: "DIAMOND BANK", code: "063", usesNuban: true },
  { name: "ECOBANK NIGERIA", code: "050", usesNuban: true },
  { name: "FIDELITY BANK", code: "070", usesNuban: true },
  { name: "FIRST BANK OF NIGERIA", code: "011", usesNuban: true },
  { name: "FIRST CITY MONUMENT BANK", code: "214", usesNuban: true },
  { name: "GUARANTY TRUST BANK", code: "058", usesNuban: true },
  { name: "HERITAGE BANK", code: "030", usesNuban: true },
  { name: "JAIZ BANK", code: "301", usesNuban: true },
  { name: "KEYSTONE BANK", code: "082", usesNuban: true },
  { name: "PROVIDUS BANK", code: "101", usesNuban: true },
  { name: "SKYE BANK", code: "076", usesNuban: true },
  { name: "STANBIC IBTC BANK", code: "221", usesNuban: true },
  { name: "STANDARD CHARTERED BANK", code: "068", usesNuban: true },
  { name: "STERLING BANK", code: "232", usesNuban: true },
  { name: "SUNTRUST", code: "100", usesNuban: true },
  { name: "UNION BANK OF NIGERIA", code: "032", usesNuban: true },
  { name: "UNITED BANK FOR AFRICA", code: "033", usesNuban: true },
  { name: "UNITY BANK", code: "215", usesNuban: true },
  { name: "WEMA BANK", code: "035", usesNuban: true },
  { name: "ZENITH BANK", code: "057", usesNuban: true },
  // Microfinance Banks - Use NUBAN
  { name: "MONIEPOINT MFB", code: "50515", usesNuban: true },
  { name: "VFD MICROFINANCE BANK", code: "566", usesNuban: true },
  { name: "SPARKLE MICROFINANCE BANK", code: "51310", usesNuban: true },
  { name: "RUBIES MFB", code: "125", usesNuban: true },
  { name: "KUDA BANK", code: "50211", usesNuban: true },
  // Payment Service Banks - Use phone numbers (NOT NUBAN)
  { name: "OPAY", code: "305", usesNuban: false },
  { name: "PALMPAY", code: "999991", usesNuban: false },
  { name: "MTN MOMO PSB", code: "120003", usesNuban: false },
  { name: "AIRTEL SMARTCASH PSB", code: "120004", usesNuban: false },
  { name: "9MOBILE 9PSB", code: "120001", usesNuban: false },
  { name: "HOPE PSB", code: "120002", usesNuban: false }
];

// Nigerian mobile phone number prefixes (without leading 0)
const phoneNumberPrefixes = [
  // MTN Nigeria
  "803", "806", "703", "706", "813", "816", "810", "814", "903", "906", "913", "916",
  // Airtel Nigeria
  "802", "808", "708", "812", "701", "902", "901", "907", "912",
  // Globacom (Glo)
  "805", "807", "705", "815", "811", "905", "915",
  // 9mobile (formerly Etisalat)
  "809", "817", "818", "908", "909"
];

// Banks that use phone numbers as account numbers
const phoneNumberBanks = banks.filter(bank => bank.usesNuban === false);

/**
 * Checks if an account number appears to be a Nigerian phone number
 */
const isPhoneNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length !== 10) return false;
  const prefix = accountNumber.substring(0, 3);
  return phoneNumberPrefixes.includes(prefix);
};

/**
 * Reconstructs the full Nigerian phone number from an account number
 */
const reconstructPhoneNumber = (accountNumber) => {
  return "0" + accountNumber;
};

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
  const looksLikePhoneNumber = isPhoneNumber(accountNumber);

  console.log("\n" + "=".repeat(80));
  console.log(`Testing Account Number: ${accountNumber}`);
  console.log("=".repeat(80));
  console.log(`Serial Number: ${serialNumber}`);
  console.log(`Check Digit: ${actualCheckDigit}`);

  // Phone number detection
  if (looksLikePhoneNumber) {
    console.log("\n📱 PHONE NUMBER DETECTED!");
    console.log("-".repeat(80));
    console.log(`  This account number appears to be a Nigerian phone number.`);
    console.log(`  Reconstructed Phone: ${reconstructPhoneNumber(accountNumber)}`);
    console.log(`\n  Possible Banks (use phone numbers as account numbers):`);
    phoneNumberBanks.forEach(bank => {
      console.log(`  📞 ${bank.name.padEnd(35)} (Code: ${bank.code})`);
    });
    console.log(`\n  Total: ${phoneNumberBanks.length} bank(s)`);
  }

  console.log("=".repeat(80));

  // Only run NUBAN validation on banks that use NUBAN
  const nubanBanks = banks.filter(b => b.usesNuban);

  let oldMatches = [];
  let newMatches = [];

  nubanBanks.forEach((bank) => {
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

  console.log("\n📊 NUBAN VALIDATION - Current Implementation (3-digit codes only):");
  console.log("-".repeat(80));
  if (oldMatches.length > 0) {
    oldMatches.forEach(bank => {
      console.log(`  ✓ ${bank.name.padEnd(35)} (Code: ${bank.code})`);
    });
    console.log(`\n  Total: ${oldMatches.length} bank(s)`);
  } else {
    console.log("  ❌ No matches found");
  }

  console.log("\n📊 NUBAN VALIDATION - 03BALOGUN Implementation (3, 5, 6-digit codes):");
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

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📋 SUMMARY:");
  console.log("-".repeat(80));
  if (looksLikePhoneNumber) {
    console.log(`  ⚠️  Account looks like a phone number - likely a PSB (OPay, PalmPay, MTN MoMo, etc.)`);
    if (newMatches.length > 0) {
      console.log(`  ℹ️  Also passes NUBAN validation for ${newMatches.length} traditional bank(s)`);
    }
  } else {
    if (newMatches.length > 0) {
      console.log(`  ✅ Valid NUBAN - matches ${newMatches.length} bank(s)`);
    } else {
      console.log(`  ❌ No NUBAN matches found - may be invalid or from an unlisted bank`);
    }
  }
  console.log("=".repeat(80) + "\n");
};

// Get account number from command line or use default
const accountNumber = process.argv[2] || "1100000121";
testAccount(accountNumber);
