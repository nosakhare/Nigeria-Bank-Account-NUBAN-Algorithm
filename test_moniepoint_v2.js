// Test Moniepoint with different code variations
const seed = "373373373373";

const generateCheckDigit = (serialNumber, bankCode) => {
  serialNumber = serialNumber.padStart(9, "0");
  let cipher = bankCode + serialNumber;
  let sum = 0;

  cipher.split("").forEach((item, index) => {
    if (seed[index]) {
      sum += item * seed[index];
    }
  });

  sum %= 10;
  let checkDigit = 10 - sum;
  checkDigit = checkDigit == 10 ? 0 : checkDigit;

  return checkDigit;
};

const accountNumber = "4000675874";
const serialNumber = accountNumber.substring(0, 9);
const actualCheckDigit = accountNumber[9];

console.log("Testing different bank code variations for Moniepoint:\n");
console.log("=".repeat(70));

// Test different code formats
const codeVariations = [
  { name: "Last 3 digits", code: "515" },
  { name: "First 3 digits", code: "505" },
  { name: "With prefix 9 + first 2", code: "950" },
  { name: "Middle 3 digits", code: "051" },
];

codeVariations.forEach(variation => {
  const checkDigit = generateCheckDigit(serialNumber, variation.code);
  const match = checkDigit == actualCheckDigit ? "✓ MATCH!" : "✗ No match";
  console.log(`${variation.name.padEnd(25)} Code: ${variation.code} → Check Digit: ${checkDigit} ${match}`);
});

console.log("=".repeat(70));
console.log(`\nAccount Number: ${accountNumber}`);
console.log(`Actual Check Digit: ${actualCheckDigit}`);
