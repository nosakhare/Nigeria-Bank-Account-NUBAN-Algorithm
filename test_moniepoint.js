// Test Moniepoint account validation
const seed = "373373373373";

const generateCheckDigit = (serialNumber, bankCode) => {
  // Pad serial number to 9 digits
  serialNumber = serialNumber.padStart(9, "0");

  // For 5-digit codes, we need to adjust the algorithm
  // The cipher should still be 12 digits total
  let cipher = bankCode + serialNumber;

  console.log(`Bank Code: ${bankCode} (${bankCode.length} digits)`);
  console.log(`Serial Number: ${serialNumber}`);
  console.log(`Cipher: ${cipher} (${cipher.length} digits)`);

  let sum = 0;
  let calculation = [];

  cipher.split("").forEach((item, index) => {
    let product = item * seed[index];
    sum += product;
    calculation.push(`${item}×${seed[index]}=${product}`);
  });

  console.log(`\nCalculation: ${calculation.join(' + ')}`);
  console.log(`Sum: ${sum}`);

  sum %= 10;
  console.log(`Sum % 10: ${sum}`);

  let checkDigit = 10 - sum;
  checkDigit = checkDigit == 10 ? 0 : checkDigit;

  console.log(`Check Digit: 10 - ${sum} = ${checkDigit}`);

  return checkDigit;
};

// Moniepoint details
const moniepointCode = "50515"; // 5-digit code for microfinance banks
const accountNumber = "4000675874";
const serialNumber = accountNumber.substring(0, 9);
const actualCheckDigit = accountNumber[9];

console.log("=".repeat(60));
console.log("Testing Moniepoint Account Validation");
console.log("=".repeat(60));
console.log(`Account Number: ${accountNumber}`);
console.log(`Serial Number: ${serialNumber}`);
console.log(`Actual Check Digit: ${actualCheckDigit}`);
console.log("=".repeat(60));
console.log();

const calculatedCheckDigit = generateCheckDigit(serialNumber, moniepointCode);

console.log("\n" + "=".repeat(60));
if (calculatedCheckDigit == actualCheckDigit) {
  console.log(`✓ VALID! Account ${accountNumber} belongs to Moniepoint MFB`);
} else {
  console.log(`✗ INVALID! Expected check digit: ${calculatedCheckDigit}, Got: ${actualCheckDigit}`);
}
console.log("=".repeat(60));
