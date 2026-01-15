var { NotFoundError } = require("restify-errors");

const banks = [
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

// Updated algorithm based on 03balogun's implementation
// Source: https://github.com/03balogun/nuban-bank-prediction-algorithm
// CBN Revised Standards (March 2020)
const bankCodeWeights = [3, 7, 3, 3, 7, 3];
const serialNumberWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3];
const nubanLength = 10;
const serialNumLength = 9;
let error;

module.exports = {
  getAccountBanks: (req, res, next) => {
    let accountNumber = req.params.account;

    let accountBanks = [];

    banks.forEach((item, index) => {
      if (isBankAccountValid(accountNumber, item.code)) {
        accountBanks.push(item);
      }
    });

    res.send(accountBanks);
  },
  createAccountWithSerial: (req, res, next) => {
    let bankCode = req.params.bank;
    let bank = banks.find(bank => bank.code == bankCode);

    if (!bank) {
      return next(
        new NotFoundError(
          "We do not recognize this code as a Nigerian commercial bank code"
        )
      );
    }

    try {
      let serialNumber = req.body.serialNumber.padStart(serialNumLength, "0");
      let nuban = `${serialNumber}${generateCheckDigit(
        serialNumber,
        bankCode
      )}`;

      let account = {
        serialNumber,
        nuban,
        bankCode,
        bank
      };

      res.send(account);
    } catch (err) {
      next(err);
    }
  }
};

/**
 * Helper function to calculate weighted sum
 * @param {string} value - The string of digits to process
 * @param {number[]} weights - The weight array
 * @returns {number} The weighted sum
 */
const calculateWeightedSum = (value, weights) => {
  if (value.length !== weights.length) {
    throw new Error(
      `Value length (${value.length}) must match weights length (${weights.length})`
    );
  }

  return value.split("").reduce((sum, digit, index) => {
    return sum + Number(digit) * weights[index];
  }, 0);
};

/**
 * Pads bank code to 6 digits based on CBN revised standards
 * - 3-digit codes: Pad with "000" prefix → "000058" (6 digits)
 * - 5-digit codes: Prefix with "9" → "950515" (6 digits)
 * - 6-digit codes: Use as-is
 * @param {string} bankCode - The bank code to pad
 * @returns {string} The padded 6-digit bank code
 */
const padBankCode = (bankCode) => {
  let paddedCode = bankCode.replace(/\D/g, ""); // Remove non-digits

  if (paddedCode.length === 3) {
    paddedCode = `000${paddedCode}`;
  } else if (paddedCode.length === 5) {
    paddedCode = `9${paddedCode}`;
  }

  if (paddedCode.length !== 6) {
    throw new Error(
      `Invalid bank code length. Bank code must be 3, 5, or 6 digits. Got: ${bankCode} (${paddedCode.length} digits)`
    );
  }

  return paddedCode;
};

/**
 * Generates check digit using the updated CBN algorithm (March 2020)
 * Based on 03balogun's implementation
 * @param {string} serialNumber - The 9-digit serial number
 * @param {string} bankCode - The bank code (3, 5, or 6 digits)
 * @returns {number} The check digit (0-9)
 */
const generateCheckDigit = (serialNumber, bankCode) => {
  if (serialNumber.length > serialNumLength) {
    throw new Error(
      `Serial number should be at most ${serialNumLength}-digits long.`
    );
  }

  serialNumber = serialNumber.padStart(serialNumLength, "0");
  const paddedBankCode = padBankCode(bankCode);

  // Step 1: Calculate weighted sum for bank code (6 digits)
  const bankCodeSum = calculateWeightedSum(paddedBankCode, bankCodeWeights);

  // Step 2: Calculate weighted sum for serial number (9 digits)
  const serialNumberSum = calculateWeightedSum(
    serialNumber,
    serialNumberWeights
  );

  // Step 3: Calculate total and apply modulo 10
  const total = bankCodeSum + serialNumberSum;
  const remainder = total % 10;

  // Step 4: Subtract from 10 to get check digit (if 10, use 0)
  const checkDigit = 10 - remainder;

  return checkDigit === 10 ? 0 : checkDigit;
};

/**
 * Validates a NUBAN account number against a bank code
 *
 * Algorithm sources:
 * - Original: https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF
 * - Revised (2020): https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf
 * - Implementation: https://github.com/03balogun/nuban-bank-prediction-algorithm
 *
 * The approved NUBAN format ABC-DEFGHIJKL-M where:
 * - ABC (or ABCDEF for OFIs) is the bank code assigned by the CBN
 * - DEFGHIJKL is the NUBAN Account serial number (9 digits)
 * - M is the NUBAN Check Digit, required for account number validation
 *
 * @param {string} accountNumber - The 10-digit NUBAN account number
 * @param {string} bankCode - The bank code (3, 5, or 6 digits)
 * @returns {boolean} True if valid, false otherwise
 */
const isBankAccountValid = (accountNumber, bankCode) => {
  if (!accountNumber || accountNumber.length !== nubanLength) {
    error = `NUBAN must be ${nubanLength} digits long`;
    return false;
  }

  try {
    let serialNumber = accountNumber.substring(0, 9);
    let checkDigit = generateCheckDigit(serialNumber, bankCode);

    return checkDigit == accountNumber[9];
  } catch (err) {
    // If bank code is invalid, return false instead of throwing
    return false;
  }
};
