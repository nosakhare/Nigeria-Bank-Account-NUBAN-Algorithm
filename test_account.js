// Test script to check which bank an account belongs to
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
  { name: "ZENITH BANK", code: "057" }
];

const seed = "373373373373";

const generateCheckDigit = (serialNumber, bankCode) => {
  serialNumber = serialNumber.padStart(9, "0");
  let cipher = bankCode + serialNumber;
  let sum = 0;

  cipher.split("").forEach((item, index) => {
    sum += item * seed[index];
  });

  sum %= 10;
  let checkDigit = 10 - sum;
  checkDigit = checkDigit == 10 ? 0 : checkDigit;

  return checkDigit;
};

const isBankAccountValid = (accountNumber, bankCode) => {
  if (!accountNumber || accountNumber.length != 10) {
    return false;
  }

  let serialNumber = accountNumber.substring(0, 9);
  let checkDigit = generateCheckDigit(serialNumber, bankCode);

  return checkDigit == accountNumber[9];
};

// Test the account number
const accountNumber = process.argv[2] || "0088116788";

console.log(`\nTesting account number: ${accountNumber}\n`);
console.log("Valid for the following bank(s):");
console.log("=" .repeat(50));

let matchingBanks = [];
banks.forEach((bank) => {
  if (isBankAccountValid(accountNumber, bank.code)) {
    matchingBanks.push(bank);
    console.log(`✓ ${bank.name} (Code: ${bank.code})`);
  }
});

if (matchingBanks.length === 0) {
  console.log("No matching banks found. The account number may be invalid.");
} else {
  console.log("\n" + "=".repeat(50));
  console.log(`Total matches: ${matchingBanks.length} bank(s)`);
}
