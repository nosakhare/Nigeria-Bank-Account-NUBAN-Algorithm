const fs = require("fs");
const path = require("path");

// Error class for Express
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

// Nigerian mobile phone number prefixes (without leading 0)
// These are used to detect if an account number is actually a phone number
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

/**
 * Checks if an account number appears to be a Nigerian phone number
 * Phone numbers in Nigeria are 11 digits starting with 0, but when used as
 * account numbers, the leading 0 is removed, making them 10 digits.
 * @param {string} accountNumber - The 10-digit account number to check
 * @returns {boolean} True if the account number matches a phone number pattern
 */
const isPhoneNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length !== 10) return false;
  const prefix = accountNumber.substring(0, 3);
  return phoneNumberPrefixes.includes(prefix);
};

/**
 * Reconstructs the full Nigerian phone number from an account number
 * @param {string} accountNumber - The 10-digit account number
 * @returns {string} The full 11-digit phone number with leading 0
 */
const reconstructPhoneNumber = (accountNumber) => {
  return "0" + accountNumber;
};

// Bank registry is loaded from data/banks.json so the list can be updated
// (new MFBs/fintechs licensed, name corrections) without editing code.
// Override the path with the NUBAN_BANKS_PATH env var (absolute or relative).
const DEFAULT_BANKS_PATH = path.join(__dirname, "..", "data", "banks.json");
const banksPath = process.env.NUBAN_BANKS_PATH
  ? path.resolve(process.env.NUBAN_BANKS_PATH)
  : DEFAULT_BANKS_PATH;
const banks = JSON.parse(fs.readFileSync(banksPath, "utf8"));

// Banks that use phone numbers as account numbers instead of NUBAN
const phoneNumberBanks = banks.filter(bank => bank.usesNuban === false);

// Updated algorithm based on 03balogun's implementation
// Source: https://github.com/03balogun/nuban-bank-prediction-algorithm
// CBN Revised Standards (March 2020)
const bankCodeWeights = [3, 7, 3, 3, 7, 3];
const serialNumberWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3];
const nubanLength = 10;
const serialNumLength = 9;
let error;

// Top 50 banks by actual transaction volume (ranked by popularity)
const bankPopularity = {
  // Top tier - Digital/Fintech leaders (500+ points)
  "OPAY DIGITAL SERVICES LIMITED (OPAY)": 500,
  "MONIEPOINT MICROFINANCE BANK": 490,
  "PALMPAY": 480,
  "KUDA BANK": 470,

  // Major commercial banks (400-460 points)
  "ACCESS BANK": 460,
  "UNITED BANK FOR AFRICA": 450,
  "FIRST BANK OF NIGERIA": 440,
  "GUARANTY TRUST BANK": 430,
  "ZENITH BANK": 420,
  "STERLING BANK": 410,
  "WEMA BANK": 400,

  // Mid-tier commercial & digital (300-390 points)
  "FIRST CITY MONUMENT BANK": 390,
  "FIDELITY BANK": 380,
  "UNION BANK OF NIGERIA": 370,
  "PROVIDUS BANK": 360,
  "ECOBANK NIGERIA": 350,
  "PAGA": 340,
  "POLARIS BANK": 330,
  "FAIRMONEY MICROFINANCE BANK": 320,
  "9MOBILE 9PAYMENT SERVICE BANK": 310,
  "STANBIC IBTC BANK": 300,

  // Popular PSBs & MFBs (200-290 points)
  "AIRTEL SMARTCASH PSB": 290,
  "VFD MICROFINANCE BANK": 280,
  "KEYSTONE BANK": 270,
  "MTN MOMO PSB": 260,
  "GLOBUS BANK": 250,
  "ACCESS BANK (DIAMOND)": 240,
  "SAFE HAVEN MFB": 230,
  "JAIZ BANK": 220,
  "UNITY BANK": 210,
  "PREMIUM TRUST BANK": 200,

  // Growing digital banks (100-190 points)
  "POCKET APP": 190,
  "TAJ BANK": 180,
  "CARBON": 170,
  "CASHCONNECT MFB": 160,
  "GOMONEY": 150,
  "LOTUS BANK": 140,
  "PARALLEX BANK": 130,
  "OPTIMUS BANK LIMITED": 120,
  "BRANCH INTERNATIONAL FINANCIAL SERVICES LIMITED": 110,
  "STANDARD CHARTERED BANK": 100,

  // Other notable banks (50-90 points)
  "KREDI MONEY MFB LTD": 90,
  "SPARKLE MICROFINANCE BANK": 80,
  "VFD MICROFINANCE BANK LIMITED": 70,
  "SAFE HAVEN MICROFINANCE BANK LIMITED": 60,
  "PAYSTACK-TITAN": 50
};

/**
 * Normalizes a bank name for resilient matching: uppercases, replaces runs of
 * non-alphanumerics with a single space, and trims. This decouples popularity
 * and prefix lookups from exact-string keys, so a casing/punctuation/whitespace
 * edit to a bank name no longer silently drops it to the base score. Whitespace
 * is preserved as a token boundary, so distinct banks that share a first word
 * (e.g. FIRST BANK OF NIGERIA vs FIRST CITY MONUMENT BANK) stay distinct.
 * @param {string} name
 * @returns {string}
 */
const normalizeName = (name) =>
  String(name).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();

// Pre-normalized popularity map, built once, for case/punctuation-insensitive lookup.
const normalizedPopularity = Object.fromEntries(
  Object.entries(bankPopularity).map(([name, score]) => [normalizeName(name), score])
);

// Account-number prefix -> issuer signal. Some banks issue NUBAN serials in
// known leading-digit ranges, so the account number's own prefix disambiguates
// when several banks all produce a valid check digit. This is a ranking nudge,
// not a hard match. Keyed by normalized bank name.
const issuerPrefixesByBank = {
  // Moniepoint NUBAN ranges (from Blockroll's nuban-prediction data).
  "MONIEPOINT MICROFINANCE BANK": ["56", "54", "81", "50", "53", "55", "82", "63", "58", "57", "59", "65", "90"],
  // Kuda account numbers begin with these.
  "KUDA BANK": ["110", "20", "30", "70"]
};
const normalizedIssuerPrefixes = Object.fromEntries(
  Object.entries(issuerPrefixesByBank).map(([name, prefixes]) => [normalizeName(name), prefixes])
);

// Boost applied when the account number's prefix matches a bank's known issuing
// range. Large enough to act as a tiebreaker among equally-valid check-digit
// matches, without overriding the phone-number PSB boost (1000).
const PREFIX_BOOST = 250;

/**
 * Ranks a bank match based on actual transaction volume data plus the account
 * number's own prefix signal. Returns a confidence score (higher is more likely).
 */
const rankBankMatch = (bank, accountNumber, isPhoneNumber) => {
  let score = 0;
  const normalized = normalizeName(bank.name);

  // If account looks like a phone number, heavily favor PSBs
  if (isPhoneNumber && !bank.usesNuban) {
    score += 1000; // PSBs get massive boost for phone numbers
  }

  // Apply popularity score (resilient to name casing/punctuation drift)
  if (normalizedPopularity[normalized] !== undefined) {
    score += normalizedPopularity[normalized];
  } else {
    // Banks not in top 50 get base score by type
    const isCommercialBank = bank.code.length === 3;
    const isMicrofinance = bank.code.length === 5;
    const isPaymentPlatform = bank.code.length === 6;

    if (isCommercialBank) score += 40;
    else if (isMicrofinance) score += 20;
    else if (isPaymentPlatform) score += 10;
    else score += 5;
  }

  // Prefix signal: nudge banks whose known issuing range matches this account.
  const prefixes = normalizedIssuerPrefixes[normalized];
  if (prefixes && accountNumber && prefixes.some(p => accountNumber.startsWith(p))) {
    score += PREFIX_BOOST;
  }

  return score;
};

module.exports = {
  getAccountBanks: (req, res, next) => {
    let accountNumber = req.params.account;

    // Check if account number looks like a phone number
    const looksLikePhoneNumber = isPhoneNumber(accountNumber);

    // Get NUBAN matches (only from banks that use NUBAN)
    let nubanMatches = [];
    banks.forEach((item) => {
      if (item.usesNuban && isBankAccountValid(accountNumber, item.code)) {
        const confidence = rankBankMatch(item, accountNumber, looksLikePhoneNumber);
        nubanMatches.push({
          ...item,
          confidence
        });
      }
    });

    // Sort by confidence score (highest first)
    nubanMatches.sort((a, b) => b.confidence - a.confidence);

    // For phone numbers, also rank PSBs
    let rankedPhoneMatches = [];
    if (looksLikePhoneNumber) {
      rankedPhoneMatches = phoneNumberBanks.map(bank => ({
        ...bank,
        confidence: rankBankMatch(bank, accountNumber, true)
      })).sort((a, b) => b.confidence - a.confidence);
    }

    // Build response with hybrid results
    const response = {
      accountNumber,
      isPhoneNumber: looksLikePhoneNumber,
      phoneNumber: looksLikePhoneNumber ? reconstructPhoneNumber(accountNumber) : null,
      nubanMatches,
      phoneMatches: rankedPhoneMatches,
      totalMatches: nubanMatches.length + rankedPhoneMatches.length
    };

    res.send(response);
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

    if (bank.usesNuban === false) {
      return next(
        new BadRequestError(
          `${bank.name} does not use NUBAN. Accounts for this bank are phone-number based and cannot be generated via this endpoint.`
        )
      );
    }

    const rawSerial = req.body && req.body.serialNumber;
    if (typeof rawSerial !== "string" || !/^\d{1,9}$/.test(rawSerial)) {
      return next(
        new BadRequestError(
          `serialNumber must be a string of 1-${serialNumLength} digits`
        )
      );
    }

    try {
      let serialNumber = rawSerial.padStart(serialNumLength, "0");
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

Object.assign(module.exports, {
  banks,
  generateCheckDigit,
  isBankAccountValid,
  isPhoneNumber,
  padBankCode,
  reconstructPhoneNumber,
  BadRequestError,
  NotFoundError
});
