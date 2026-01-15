// Test the 03balogun approach for handling 5-digit bank codes
// Source: https://github.com/03balogun/nuban-bank-prediction-algorithm

const bankCodeWeights = [3, 7, 3, 3, 7, 3];
const serialNumberWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3];

const calculateWeightedSum = (value, weights) => {
  if (value.length !== weights.length) {
    throw new Error(`value and weights must have the same length. Value: ${value} (${value.length}), Weights: ${weights.length}`);
  }

  return value.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
}

const computeCheckDigit = (bankCode, serialNumber) => {
  const result = calculateWeightedSum(bankCode, bankCodeWeights) + calculateWeightedSum(serialNumber, serialNumberWeights);

  const subtractionResult = 10 - (result % 10);

  return subtractionResult === 10 ? 0 : subtractionResult;
}

const isBankAccountValid = (accountNumber, bankCode) => {
  if (accountNumber.length !== 10) {
    throw new Error('Invalid account number, account number must be 10 digits long');
  }

  let paddedBankCode = bankCode.replace(/\D/g, '');

  console.log(`Original bank code: ${bankCode} (${bankCode.length} digits)`);

  // Handle different bank code lengths
  if (paddedBankCode.length === 3) {
    paddedBankCode = `000${paddedBankCode}`;
  } else if (paddedBankCode.length === 5) {
    paddedBankCode = `9${paddedBankCode}`;
  }

  console.log(`Padded bank code: ${paddedBankCode} (${paddedBankCode.length} digits)`);

  if (paddedBankCode.length !== 6) {
    throw new Error(`Invalid bank code, bank code must be 3, 5 or 6 digits long. ${paddedBankCode} is ${paddedBankCode.length} digits long`);
  }

  const serialNumber = accountNumber.substring(0, 9);
  const accountCheckDigit = accountNumber[9];

  console.log(`Serial number: ${serialNumber}`);
  console.log(`Account check digit: ${accountCheckDigit}`);

  // Calculate weighted sums
  const bankCodeSum = calculateWeightedSum(paddedBankCode, bankCodeWeights);
  const serialNumberSum = calculateWeightedSum(serialNumber, serialNumberWeights);

  console.log(`\nBank code weighted sum: ${bankCodeSum}`);
  console.log(`Serial number weighted sum: ${serialNumberSum}`);
  console.log(`Total sum: ${bankCodeSum + serialNumberSum}`);
  console.log(`Sum % 10: ${(bankCodeSum + serialNumberSum) % 10}`);

  const checkDigit = computeCheckDigit(paddedBankCode, serialNumber);

  console.log(`Calculated check digit: ${checkDigit}`);

  return checkDigit?.toString() === accountCheckDigit;
}

// Test with Moniepoint account
console.log("=".repeat(70));
console.log("Testing 03balogun's Algorithm with Moniepoint");
console.log("=".repeat(70));

const moniepointAccount = "4000675874";
const moniepointCode = "50515";

try {
  const isValid = isBankAccountValid(moniepointAccount, moniepointCode);
  console.log("\n" + "=".repeat(70));
  if (isValid) {
    console.log(`✓ VALID! Account ${moniepointAccount} belongs to Moniepoint MFB`);
  } else {
    console.log(`✗ INVALID! Account does not match Moniepoint MFB`);
  }
  console.log("=".repeat(70));
} catch (error) {
  console.error("\nError:", error.message);
}

// Also test with GTBank for comparison
console.log("\n\n" + "=".repeat(70));
console.log("Testing with GTBank (3-digit code) for comparison");
console.log("=".repeat(70));

const gtbankAccount = "4000675874";
const gtbankCode = "058";

try {
  const isValid = isBankAccountValid(gtbankAccount, gtbankCode);
  console.log("\n" + "=".repeat(70));
  if (isValid) {
    console.log(`✓ VALID! Account ${gtbankAccount} matches GTBank`);
  } else {
    console.log(`✗ INVALID! Account does not match GTBank`);
  }
  console.log("=".repeat(70));
} catch (error) {
  console.error("\nError:", error.message);
}
