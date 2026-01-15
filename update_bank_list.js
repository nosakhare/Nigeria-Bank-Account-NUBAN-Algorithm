// Script to update and test expanded bank list with CBN codes

const expandedBanks = [
  // Commercial Banks (3-digit codes)
  { name: "ACCESS BANK", code: "044" },
  { name: "ACCESS BANK (DIAMOND)", code: "063" },
  { name: "CITIBANK NIGERIA", code: "023" },
  { name: "ECOBANK NIGERIA", code: "050" },
  { name: "FIDELITY BANK", code: "070" },
  { name: "FIRST BANK OF NIGERIA", code: "011" },
  { name: "FIRST CITY MONUMENT BANK", code: "214" },
  { name: "GLOBUS BANK", code: "00103" },
  { name: "GUARANTY TRUST BANK", code: "058" },
  { name: "HERITAGE BANK", code: "030" },
  { name: "JAIZ BANK", code: "301" },
  { name: "KEYSTONE BANK", code: "082" },
  { name: "LOTUS BANK", code: "303" },
  { name: "PARALLEX BANK", code: "526" },
  { name: "POLARIS BANK", code: "076" },
  { name: "PROVIDUS BANK", code: "020" },
  { name: "STANBIC IBTC BANK", code: "221" },
  { name: "STANDARD CHARTERED BANK", code: "068" },
  { name: "STERLING BANK", code: "232" },
  { name: "SUNTRUST BANK", code: "100" },
  { name: "TAJ BANK", code: "302" },
  { name: "TITAN TRUST BANK", code: "102" },
  { name: "UNION BANK OF NIGERIA", code: "032" },
  { name: "UNITED BANK FOR AFRICA", code: "033" },
  { name: "UNITY BANK", code: "215" },
  { name: "WEMA BANK", code: "035" },
  { name: "ZENITH BANK", code: "057" },

  // Microfinance Banks (5-digit codes) - Popular/Digital Banks
  { name: "CARBON", code: "565" },
  { name: "EYOWO", code: "50126" },
  { name: "FAIRMONEY MICROFINANCE BANK", code: "51318" },
  { name: "KUDA BANK", code: "50211" },
  { name: "MONIEPOINT MICROFINANCE BANK", code: "50515" },
  { name: "SPARKLE MICROFINANCE BANK", code: "51310" },
  { name: "VFD MICROFINANCE BANK", code: "090110" },
  { name: "RUBIES MFB", code: "50596" },

  // Other Notable MFBs
  { name: "ACCION MICROFINANCE BANK", code: "602" },
  { name: "BAOBAB MICROFINANCE BANK", code: "MFB50992" },
  { name: "CONSUMER MICROFINANCE BANK", code: "50910" },
  { name: "GROOMING MICROFINANCE BANK", code: "51276" },
  { name: "HACKMAN MICROFINANCE BANK", code: "51251" },
  { name: "IBILE MICROFINANCE BANK", code: "51244" },
  { name: "MINT MFB", code: "50304" },
  { name: "TANGERINE MFB", code: "51214" },

  // Payment Service Banks (6-digit codes)
  { name: "9MOBILE 9PAYMENT SERVICE BANK", code: "120001" },
  { name: "AIRTEL SMARTCASH PSB", code: "120004" },
  { name: "HOPE PSB", code: "120002" },
  { name: "MTN MOMO PSB", code: "120003" },
  { name: "PALMPAY", code: "999991" },

  // Digital Payment Platforms
  { name: "PAGA", code: "100002" },
  { name: "GOMONEY", code: "100022" },
  { name: "KONGAPAY", code: "100025" },
  { name: "PARKWAY", code: "100028" },
  { name: "PREMIUM TRUST BANK", code: "100032" },

  // Mortgage Banks
  { name: "ABBEY MORTGAGE BANK", code: "404" },
  { name: "AG MORTGAGE BANK", code: "90077" },
  { name: "IMPERIAL HOMES MORTGAGE BANK", code: "415" },
  { name: "LIVING TRUST MORTGAGE BANK", code: "031" },

  // Merchant Banks
  { name: "CORONATION MERCHANT BANK", code: "559" },
  { name: "FSDH MERCHANT BANK", code: "501" },
  { name: "GREENWICH MERCHANT BANK", code: "562" },
  { name: "NOVA MERCHANT BANK", code: "561" },
  { name: "RAND MERCHANT BANK", code: "50231" }
];

console.log("=".repeat(80));
console.log("EXPANDED BANK LIST ANALYSIS");
console.log("=".repeat(80));
console.log(`\nTotal banks in expanded list: ${expandedBanks.length}`);

// Categorize banks
const categories = {
  commercial: expandedBanks.filter(b => b.code.length === 3 || (b.code.length === 5 && parseInt(b.code) < 1000)),
  microfinance: expandedBanks.filter(b => b.code.length === 5 && parseInt(b.code) >= 50000 && parseInt(b.code) < 90000 || b.code.startsWith("MFB")),
  psb: expandedBanks.filter(b => b.code.startsWith("120") || b.code === "999991"),
  digital: expandedBanks.filter(b => b.code.startsWith("100") && b.code !== "100032"),
  mortgage: expandedBanks.filter(b => ["404", "90077", "415", "031"].includes(b.code)),
  merchant: expandedBanks.filter(b => ["559", "501", "562", "561", "50231"].includes(b.code))
};

console.log("\nBreakdown by category:");
console.log(`  Commercial Banks: ${categories.commercial.length}`);
console.log(`  Microfinance Banks: ${categories.microfinance.length}`);
console.log(`  Payment Service Banks: ${categories.psb.length}`);
console.log(`  Digital Payment Platforms: ${categories.digital.length}`);
console.log(`  Mortgage Banks: ${categories.mortgage.length}`);
console.log(`  Merchant Banks: ${categories.merchant.length}`);

// Check for code length distribution
const codeLengths = {};
expandedBanks.forEach(bank => {
  const len = bank.code.replace(/\D/g, '').length;
  codeLengths[len] = (codeLengths[len] || 0) + 1;
});

console.log("\nCode length distribution:");
Object.keys(codeLengths).sort().forEach(len => {
  console.log(`  ${len}-digit codes: ${codeLengths[len]} banks`);
});

// Test a few accounts to see expanded coverage
console.log("\n" + "=".repeat(80));
console.log("TESTING EXPANDED BANK LIST");
console.log("=".repeat(80));

const testAccounts = [
  "4000675874",
  "5822207333",
  "2182813377",
  "1100000121"
];

// Simple validation function for testing
const bankCodeWeights = [3, 7, 3, 3, 7, 3];
const serialNumberWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3];

const calculateWeightedSum = (value, weights) => {
  if (value.length !== weights.length) return null;
  return value.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
};

const padBankCode = (code) => {
  let paddedCode = code.replace(/\D/g, '');
  if (paddedCode.length === 3) {
    paddedCode = `000${paddedCode}`;
  } else if (paddedCode.length === 5) {
    paddedCode = `9${paddedCode}`;
  }
  if (paddedCode.length !== 6) return null;
  return paddedCode;
};

const validateAccount = (accountNumber, bankCode) => {
  const serialNumber = accountNumber.substring(0, 9).padStart(9, "0");
  const actualCheckDigit = accountNumber[9];

  const paddedBankCode = padBankCode(bankCode);
  if (!paddedBankCode) return false;

  const bankCodeSum = calculateWeightedSum(paddedBankCode, bankCodeWeights);
  const serialNumberSum = calculateWeightedSum(serialNumber, serialNumberWeights);

  if (bankCodeSum === null || serialNumberSum === null) return false;

  const total = bankCodeSum + serialNumberSum;
  const remainder = total % 10;
  const checkDigit = 10 - remainder;
  const finalCheckDigit = checkDigit === 10 ? 0 : checkDigit;

  return finalCheckDigit == actualCheckDigit;
};

testAccounts.forEach(account => {
  console.log(`\nAccount: ${account}`);
  console.log("-".repeat(80));

  const matches = expandedBanks.filter(bank => validateAccount(account, bank.code));

  if (matches.length > 0) {
    console.log(`✓ Found ${matches.length} matching bank(s):`);
    matches.forEach(bank => {
      console.log(`  • ${bank.name.padEnd(40)} (Code: ${bank.code})`);
    });
  } else {
    console.log("  ❌ No matches found");
  }
});

console.log("\n" + "=".repeat(80));
console.log("RECOMMENDATION");
console.log("=".repeat(80));
console.log("\nThis expanded list includes:");
console.log("  ✓ All major commercial banks (27 banks)");
console.log("  ✓ Popular digital/fintech banks (Kuda, Moniepoint, Carbon, FairMoney, etc.)");
console.log("  ✓ All payment service banks (5 PSBs)");
console.log("  ✓ Digital payment platforms (Paga, GoMoney, etc.)");
console.log("  ✓ Major mortgage and merchant banks");
console.log("  ✓ Key microfinance banks");
console.log("\nTotal: " + expandedBanks.length + " banks (up from 29)");
console.log("\nThis provides comprehensive coverage while keeping the list manageable.");
console.log("=".repeat(80));
