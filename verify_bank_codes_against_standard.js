// Script to verify bank codes against CBN NUBAN standards
// Based on: Revised Standards on Nigeria Uniform Bank Account Number (NUBAN)
// for Banks and Other Financial Institutions - March 2020

const fs = require('fs');

console.log("=".repeat(80));
console.log("BANK CODE VERIFICATION AGAINST CBN NUBAN STANDARDS");
console.log("=".repeat(80));
console.log("\nBased on CBN Revised Standards (March 2020):");
console.log("- DMBs (Deposit Money Banks): 3-digit codes");
console.log("- OFIs (Other Financial Institutions): 5-digit codes");
console.log("- PSBs and others may have 6-digit codes or special formats");
console.log("");

// Read the banks array directly from the file
let bankList = [];
try {
  const fileContent = fs.readFileSync('./routes/nuban_util.js', 'utf8');

  // Extract the banks array using regex
  const banksMatch = fileContent.match(/const banks = \[([\s\S]*?)\];/);
  if (banksMatch) {
    // Parse the bank entries
    const banksStr = banksMatch[1];
    const bankRegex = /\{\s*name:\s*"([^"]+)"\s*,\s*code:\s*"([^"]+)"\s*,\s*usesNuban:\s*(true|false)\s*\}/g;
    let match;
    while ((match = bankRegex.exec(banksStr)) !== null) {
      bankList.push({
        name: match[1],
        code: match[2],
        usesNuban: match[3] === 'true'
      });
    }
  }
} catch (err) {
  console.error("Error reading banks:", err.message);
  process.exit(1);
}

console.log(`\nTotal banks in database: ${bankList.length}\n`);

// Categorize by code format
const issues = [];
const categories = {
  dmb_3digit: [],
  ofi_5digit: [],
  psb_6digit: [],
  special_codes: [],
  invalid_format: []
};

bankList.forEach(bank => {
  const code = bank.code;
  const numericCode = code.replace(/\D/g, '');
  const codeLength = numericCode.length;

  // Check for non-standard formats
  if (code.includes('MFB') || code.includes('FC')) {
    categories.special_codes.push(bank);
    issues.push({
      bank: bank.name,
      code: bank.code,
      issue: "Special format code (contains letters)",
      severity: "WARNING",
      note: "May need verification against CBN registry"
    });
  } else if (codeLength === 3) {
    categories.dmb_3digit.push(bank);
  } else if (codeLength === 4) {
    categories.invalid_format.push(bank);
    issues.push({
      bank: bank.name,
      code: bank.code,
      issue: "Invalid 4-digit code format",
      severity: "ERROR",
      note: "CBN standards specify 3-digit (DMB) or 5-digit (OFI) codes"
    });
  } else if (codeLength === 5) {
    categories.ofi_5digit.push(bank);
  } else if (codeLength === 6) {
    categories.psb_6digit.push(bank);
  } else {
    categories.invalid_format.push(bank);
    issues.push({
      bank: bank.name,
      code: bank.code,
      issue: `Unusual code length: ${codeLength} digits`,
      severity: "WARNING",
      note: "Verify against official CBN registry"
    });
  }

  // Check for duplicate codes
  const duplicates = bankList.filter(b => b.code === code);
  if (duplicates.length > 1) {
    const isDuplicate = issues.some(i => i.issue.includes("Duplicate code") && i.code === code);
    if (!isDuplicate) {
      issues.push({
        bank: duplicates.map(d => d.name).join(", "),
        code: code,
        issue: `Duplicate code used by ${duplicates.length} banks`,
        severity: "WARNING",
        note: "This may be intentional (e.g., same bank, different names)"
      });
    }
  }

  // Check for codes with letters (non-numeric)
  if (/[A-Z]/i.test(code) && !code.includes('MFB') && !code.includes('FC')) {
    issues.push({
      bank: bank.name,
      code: bank.code,
      issue: "Code contains letters (not purely numeric)",
      severity: "WARNING",
      note: "Verify if this is a valid CBN format"
    });
  }
});

console.log("CODE FORMAT DISTRIBUTION:");
console.log("=".repeat(80));
console.log(`3-digit codes (DMBs):              ${categories.dmb_3digit.length} banks`);
console.log(`5-digit codes (OFIs):              ${categories.ofi_5digit.length} banks`);
console.log(`6-digit codes (PSBs/Others):       ${categories.psb_6digit.length} banks`);
console.log(`Special format codes (MFB/FC):     ${categories.special_codes.length} banks`);
console.log(`Invalid/Unusual formats:           ${categories.invalid_format.length} banks`);

console.log("\n" + "=".repeat(80));
console.log("POTENTIAL ISSUES FOUND:");
console.log("=".repeat(80));

if (issues.length === 0) {
  console.log("\n✓ No issues found! All bank codes appear to follow CBN standards.");
} else {
  console.log(`\nFound ${issues.length} potential issue(s):\n`);

  // Group by severity
  const errors = issues.filter(i => i.severity === "ERROR");
  const warnings = issues.filter(i => i.severity === "WARNING");

  if (errors.length > 0) {
    console.log("ERRORS (Must be fixed):");
    console.log("-".repeat(80));
    errors.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. ${issue.bank}`);
      console.log(`   Code: ${issue.code}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Note: ${issue.note}`);
    });
  }

  if (warnings.length > 0) {
    console.log("\n\nWARNINGS (Should be verified):");
    console.log("-".repeat(80));
    warnings.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. ${issue.bank}`);
      console.log(`   Code: ${issue.code}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Note: ${issue.note}`);
    });
  }
}

console.log("\n" + "=".repeat(80));
console.log("SPECIAL FORMAT CODES (Need Manual Verification):");
console.log("=".repeat(80));
if (categories.special_codes.length > 0) {
  categories.special_codes.forEach(bank => {
    console.log(`- ${bank.name.padEnd(50)} Code: ${bank.code}`);
  });
} else {
  console.log("\nNone found.");
}

console.log("\n" + "=".repeat(80));
console.log("RECOMMENDATIONS:");
console.log("=".repeat(80));
console.log(`
1. Cross-reference all bank codes with the official CBN registry at:
   https://www.cbn.gov.ng/

2. The CBN document you have does not include the actual bank code list.
   You'll need to obtain the official "List of Banks and Other Financial
   Institutions" from CBN.

3. Pay special attention to:
   - Banks with MFB prefix codes (e.g., "MFB50992")
   - Banks with FC prefix codes (e.g., "FC40163")
   - Banks with codes containing letters (e.g., "035A")

4. Verify that all 6-digit codes (999991, 999992, 120001, etc.) are
   officially recognized PSB codes.

5. Consider checking with payment processors (Paystack, Flutterwave) for
   their bank code lists as they sync with CBN regularly.
`);

console.log("=".repeat(80));
