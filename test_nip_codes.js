// Test NIP bank codes (6-digit format) vs CBN codes
const nubanUtil = require('./routes/nuban_util.js');

// Map of banks with both code formats
const codeComparison = [
  { name: "Moniepoint", cbnCode: "50515", nipCode: "090405" },
  { name: "Kuda Bank", cbnCode: "50211", nipCode: "090267" },
  { name: "GTBank", cbnCode: "058", nipCode: "000013" },
  { name: "Access Bank", cbnCode: "044", nipCode: "000014" },
  { name: "PalmPay", cbnCode: "999991", nipCode: "100033" },
  { name: "First Bank", cbnCode: "011", nipCode: "000016" },
  { name: "Zenith Bank", cbnCode: "057", nipCode: "000015" },
  { name: "UBA", cbnCode: "033", nipCode: "000004" },
  { name: "Fidelity Bank", cbnCode: "070", nipCode: "000007" },
  { name: "Wema Bank", cbnCode: "035", nipCode: "000017" }
];

// Test accounts
const testAccounts = [
  { number: "4000675874", expectedBank: "Moniepoint" },
  { number: "5822207333", expectedBank: "Moniepoint" },
  { number: "2182813377", expectedBank: "PalmPay" },
  { number: "1100000121", expectedBank: "Zenith Bank" }
];

console.log("=".repeat(80));
console.log("Testing NIP Bank Codes (6-digit) vs CBN Codes");
console.log("=".repeat(80));

// Helper function to validate account with a specific bank code
const validateAccount = (accountNumber, bankCode) => {
  const serialNumber = accountNumber.substring(0, 9);
  const actualCheckDigit = accountNumber[9];

  try {
    // We need to access the internal function, so let's recreate it
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

    const paddedBankCode = padBankCode(bankCode);
    if (!paddedBankCode) return false;

    const paddedSerial = serialNumber.padStart(9, "0");
    const bankCodeSum = calculateWeightedSum(paddedBankCode, bankCodeWeights);
    const serialNumberSum = calculateWeightedSum(paddedSerial, serialNumberWeights);

    if (bankCodeSum === null || serialNumberSum === null) return false;

    const total = bankCodeSum + serialNumberSum;
    const remainder = total % 10;
    const checkDigit = 10 - remainder;
    const finalCheckDigit = checkDigit === 10 ? 0 : checkDigit;

    return finalCheckDigit == actualCheckDigit;
  } catch (err) {
    return false;
  }
};

testAccounts.forEach(testAccount => {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Account: ${testAccount.number} (Expected: ${testAccount.expectedBank})`);
  console.log("=".repeat(80));

  const results = {
    cbm: [],
    nip: []
  };

  codeComparison.forEach(bank => {
    // Test CBN code
    if (validateAccount(testAccount.number, bank.cbnCode)) {
      results.cbm.push(bank.name);
    }

    // Test NIP code
    if (validateAccount(testAccount.number, bank.nipCode)) {
      results.nip.push(bank.name);
    }
  });

  console.log("\n📊 CBN Bank Codes (3/5/6 digit):");
  console.log("-".repeat(80));
  if (results.cbm.length > 0) {
    results.cbm.forEach(bank => {
      const code = codeComparison.find(b => b.name === bank).cbnCode;
      const marker = bank === testAccount.expectedBank ? "✓✓" : "✓";
      console.log(`  ${marker} ${bank.padEnd(20)} (CBN Code: ${code})`);
    });
  } else {
    console.log("  ❌ No matches");
  }

  console.log("\n📊 NIP Bank Codes (6 digit):");
  console.log("-".repeat(80));
  if (results.nip.length > 0) {
    results.nip.forEach(bank => {
      const code = codeComparison.find(b => b.name === bank).nipCode;
      const marker = bank === testAccount.expectedBank ? "✓✓" : "✓";
      console.log(`  ${marker} ${bank.padEnd(20)} (NIP Code: ${code})`);
    });
  } else {
    console.log("  ❌ No matches");
  }

  console.log("\n🔍 Analysis:");
  const onlyInCBN = results.cbm.filter(b => !results.nip.includes(b));
  const onlyInNIP = results.nip.filter(b => !results.cbm.includes(b));
  const inBoth = results.cbm.filter(b => results.nip.includes(b));

  if (inBoth.length > 0) {
    console.log(`  ✓ ${inBoth.length} bank(s) match with BOTH code formats`);
  }
  if (onlyInCBN.length > 0) {
    console.log(`  ⚠ ${onlyInCBN.length} bank(s) only match with CBN codes: ${onlyInCBN.join(', ')}`);
  }
  if (onlyInNIP.length > 0) {
    console.log(`  ⚠ ${onlyInNIP.length} bank(s) only match with NIP codes: ${onlyInNIP.join(', ')}`);
  }

  if (results.cbm.length === 0 && results.nip.length === 0) {
    console.log("  ❌ No matches found with either code format");
  }
});

console.log("\n" + "=".repeat(80));
console.log("CONCLUSION");
console.log("=".repeat(80));
console.log("\nNIP codes are 6-digit codes used by NIBSS (Nigeria Inter-Bank Settlement System)");
console.log("for interbank transfers. They are different from CBN bank codes used in NUBAN.");
console.log("\nOur algorithm pads codes to 6 digits:");
console.log("  • 3-digit CBN → Prefix '000' → 6 digits");
console.log("  • 5-digit CBN → Prefix '9' → 6 digits");
console.log("  • 6-digit → Use as-is");
console.log("\nNIP codes can work with the algorithm IF they happen to produce the same");
console.log("6-digit padded value as the CBN code for that bank.");
console.log("=".repeat(80));
