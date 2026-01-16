var { NotFoundError } = require("restify-errors");

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

const banks = [
  // Commercial Banks (3-digit codes) - All use NUBAN
  { name: "ACCESS BANK", code: "044", usesNuban: true },
  { name: "ACCESS BANK (DIAMOND)", code: "063", usesNuban: true },
  { name: "CITIBANK NIGERIA", code: "023", usesNuban: true },
  { name: "ECOBANK NIGERIA", code: "050", usesNuban: true },
  { name: "FIDELITY BANK", code: "070", usesNuban: true },
  { name: "FIRST BANK OF NIGERIA", code: "011", usesNuban: true },
  { name: "FIRST CITY MONUMENT BANK", code: "214", usesNuban: true },
  { name: "GLOBUS BANK", code: "00103", usesNuban: true },
  { name: "GUARANTY TRUST BANK", code: "058", usesNuban: true },
  { name: "HERITAGE BANK", code: "030", usesNuban: true },
  { name: "JAIZ BANK", code: "301", usesNuban: true },
  { name: "KEYSTONE BANK", code: "082", usesNuban: true },
  { name: "LOTUS BANK", code: "303", usesNuban: true },
  { name: "PARALLEX BANK", code: "526", usesNuban: true },
  { name: "POLARIS BANK", code: "076", usesNuban: true },
  { name: "PROVIDUS BANK", code: "020", usesNuban: true },
  { name: "STANBIC IBTC BANK", code: "221", usesNuban: true },
  { name: "STANDARD CHARTERED BANK", code: "068", usesNuban: true },
  { name: "STERLING BANK", code: "232", usesNuban: true },
  { name: "SUNTRUST BANK", code: "100", usesNuban: true },
  { name: "TAJ BANK", code: "302", usesNuban: true },
  { name: "TITAN TRUST BANK", code: "102", usesNuban: true },
  { name: "UNION BANK OF NIGERIA", code: "032", usesNuban: true },
  { name: "UNITED BANK FOR AFRICA", code: "033", usesNuban: true },
  { name: "UNITY BANK", code: "215", usesNuban: true },
  { name: "WEMA BANK", code: "035", usesNuban: true },
  { name: "ZENITH BANK", code: "057", usesNuban: true },
  { name: "PARALLEX BANK", code: "104", usesNuban: true },
  { name: "PROVIDUS BANK", code: "101", usesNuban: true },
  { name: "OPTIMUS BANK LIMITED", code: "107", usesNuban: true },
  { name: "SIGNATURE BANK LTD", code: "106", usesNuban: true },
  { name: "PREMIUMTRUST BANK", code: "105", usesNuban: true },
  { name: "THE ALTERNATIVE BANK", code: "000304", usesNuban: true },

  // Microfinance Banks (5-digit codes) - Popular/Digital Banks - All use NUBAN
  { name: "CARBON", code: "565", usesNuban: true },
  { name: "EYOWO", code: "50126", usesNuban: true },
  { name: "FAIRMONEY MICROFINANCE BANK", code: "51318", usesNuban: true },
  { name: "KUDA BANK", code: "50211", usesNuban: true },
  { name: "MONIEPOINT MICROFINANCE BANK", code: "50515", usesNuban: true },
  { name: "SPARKLE MICROFINANCE BANK", code: "51310", usesNuban: true },
  { name: "VFD MICROFINANCE BANK", code: "090110", usesNuban: true },
  { name: "VFD MICROFINANCE BANK LIMITED", code: "566", usesNuban: true },
  { name: "RUBIES MFB", code: "50596", usesNuban: true },

  // Other Notable MFBs - All use NUBAN
  { name: "ACCION MICROFINANCE BANK", code: "602", usesNuban: true },
  { name: "BAOBAB MICROFINANCE BANK", code: "50992", usesNuban: true },
  { name: "CONSUMER MICROFINANCE BANK", code: "50910", usesNuban: true },
  { name: "GROOMING MICROFINANCE BANK", code: "51276", usesNuban: true },
  { name: "HACKMAN MICROFINANCE BANK", code: "51251", usesNuban: true },
  { name: "IBILE MICROFINANCE BANK", code: "51244", usesNuban: true },
  { name: "MINT MFB", code: "50304", usesNuban: true },
  { name: "TANGERINE MFB", code: "51214", usesNuban: true },
  { name: "TANGERINE MONEY", code: "51269", usesNuban: true },
  { name: "ABOVE ONLY MFB", code: "51204", usesNuban: true },
  { name: "ABULESORO MFB", code: "51312", usesNuban: true },
  { name: "AELLA MFB", code: "50315", usesNuban: true },
  { name: "AHMADU BELLO UNIVERSITY MICROFINANCE BANK", code: "50036", usesNuban: true },
  { name: "AKU MICROFINANCE BANK", code: "51336", usesNuban: true },
  { name: "AKUCHUKWU MICROFINANCE BANK LIMITED", code: "090561", usesNuban: true },
  { name: "AMEGY MICROFINANCE BANK", code: "090629", usesNuban: true },
  { name: "AMJU UNIQUE MFB", code: "50926", usesNuban: true },
  { name: "AMPERSAND MICROFINANCE BANK", code: "51341", usesNuban: true },
  { name: "ARAMOKO MFB", code: "50083", usesNuban: true },
  { name: "AVUENEGBE MICROFINANCE BANK", code: "090478", usesNuban: true },
  { name: "AWACASH MICROFINANCE BANK", code: "51351", usesNuban: true },
  { name: "BAINESCREDIT MFB", code: "51229", usesNuban: true },
  { name: "BANC CORP MICROFINANCE BANK", code: "50117", usesNuban: true },
  { name: "BELLBANK MICROFINANCE BANK", code: "51100", usesNuban: true },
  { name: "BENYSTA MICROFINANCE BANK LIMITED", code: "51267", usesNuban: true },
  { name: "BESTSTAR MICROFINANCE BANK", code: "50123", usesNuban: true },
  { name: "BOWEN MICROFINANCE BANK", code: "50931", usesNuban: true },
  { name: "CASHBRIDGE MICROFINANCE BANK LIMITED", code: "51353", usesNuban: true },
  { name: "CASHCONNECT MFB", code: "865", usesNuban: true },
  { name: "CEMCS MICROFINANCE BANK", code: "50823", usesNuban: true },
  { name: "CHANELLE MICROFINANCE BANK LIMITED", code: "50171", usesNuban: true },
  { name: "CHIKUM MICROFINANCE BANK", code: "312", usesNuban: true },
  { name: "CORESTEP MFB", code: "50204", usesNuban: true },
  { name: "CRESCENT MFB", code: "51297", usesNuban: true },
  { name: "CRUST MICROFINANCE BANK", code: "090560", usesNuban: true },
  { name: "DAVENPORT MICROFINANCE BANK", code: "51334", usesNuban: true },
  { name: "DOT MICROFINANCE BANK", code: "50162", usesNuban: true },
  { name: "EKIMOGUN MFB", code: "50263", usesNuban: true },
  { name: "EKONDO MICROFINANCE BANK", code: "098", usesNuban: true },
  { name: "EXCEL FINANCE BANK", code: "090678", usesNuban: true },
  { name: "FEDETH MFB", code: "50298", usesNuban: true },
  { name: "FIRMUS MFB", code: "51314", usesNuban: true },
  { name: "FIRST ROYAL MICROFINANCE BANK", code: "090164", usesNuban: true },
  { name: "FUTMINNA MICROFINANCE BANK", code: "832", usesNuban: true },
  { name: "GOLDMAN MFB", code: "090574", usesNuban: true },
  { name: "GOOD SHEPHERD MICROFINANCE BANK", code: "090664", usesNuban: true },
  { name: "GOODNEWS MICROFINANCE BANK", code: "50739", usesNuban: true },
  { name: "HASAL MICROFINANCE BANK", code: "50383", usesNuban: true },
  { name: "IBANK MICROFINANCE BANK", code: "51211", usesNuban: true },
  { name: "IKOYI OSUN MFB", code: "50439", usesNuban: true },
  { name: "ILARO POLY MICROFINANCE BANK", code: "50442", usesNuban: true },
  { name: "IMOWO MFB", code: "50453", usesNuban: true },
  { name: "INFINITY MFB", code: "50457", usesNuban: true },
  { name: "ISUA MFB", code: "090701", usesNuban: true },
  { name: "KADPOLY MFB", code: "50502", usesNuban: true },
  { name: "KANOPOLY MFB", code: "51308", usesNuban: true },
  { name: "KREDI MONEY MFB LTD", code: "50200", usesNuban: true },
  { name: "LINKS MFB", code: "50549", usesNuban: true },
  { name: "LOMA MFB", code: "50491", usesNuban: true },
  { name: "MAINSTREET MICROFINANCE BANK", code: "090171", usesNuban: true },
  { name: "MAYFAIR MFB", code: "50563", usesNuban: true },
  { name: "MUTUAL BENEFITS MICROFINANCE BANK", code: "090190", usesNuban: true },
  { name: "NDCC MICROFINANCE BANK", code: "090679", usesNuban: true },
  { name: "NET MICROFINANCE BANK", code: "51361", usesNuban: true },
  { name: "NIGERIAN NAVY MICROFINANCE BANK LIMITED", code: "51142", usesNuban: true },
  { name: "NPF MICROFINANCE BANK", code: "50629", usesNuban: true },
  { name: "PATHFINDER MICROFINANCE BANK LIMITED", code: "090680", usesNuban: true },
  { name: "PEACE MICROFINANCE BANK", code: "50743", usesNuban: true },
  { name: "PECANTRUST MICROFINANCE BANK LIMITED", code: "51226", usesNuban: true },
  { name: "PERSONAL TRUST MFB", code: "51146", usesNuban: true },
  { name: "PETRA MIRCOFINANCE BANK PLC", code: "50746", usesNuban: true },
  { name: "POLYUNWANA MFB", code: "50864", usesNuban: true },
  { name: "QUICKFUND MFB", code: "51293", usesNuban: true },
  { name: "RANDALPHA MICROFINANCE BANK", code: "090496", usesNuban: true },
  { name: "REHOBOTH MICROFINANCE BANK", code: "50761", usesNuban: true },
  { name: "REPHIDIM MICROFINANCE BANK", code: "50994", usesNuban: true },
  { name: "RIGO MICROFINANCE BANK LIMITED", code: "51286", usesNuban: true },
  { name: "ROCKSHIELD MICROFINANCE BANK", code: "50767", usesNuban: true },
  { name: "SAFE HAVEN MFB", code: "51113", usesNuban: true },
  { name: "SAFE HAVEN MICROFINANCE BANK LIMITED", code: "951113", usesNuban: true },
  { name: "SHIELD MFB", code: "50582", usesNuban: true },
  { name: "SOLID ALLIANZE MFB", code: "51062", usesNuban: true },
  { name: "SOLID ROCK MFB", code: "50800", usesNuban: true },
  { name: "STANFORD MICROFINANCE BANK", code: "090162", usesNuban: true },
  { name: "STATESIDE MICROFINANCE BANK", code: "50809", usesNuban: true },
  { name: "STELLAS MFB", code: "51253", usesNuban: true },
  { name: "SUPREME MFB", code: "50968", usesNuban: true },
  { name: "TRANSPAY MFB", code: "090708", usesNuban: true },
  { name: "U&C MICROFINANCE BANK LTD (U AND C MFB)", code: "50840", usesNuban: true },
  { name: "UCEE MFB", code: "090706", usesNuban: true },
  { name: "UHURU MFB", code: "51322", usesNuban: true },
  { name: "UNAAB MICROFINANCE BANK LIMITED", code: "50870", usesNuban: true },
  { name: "UNICAL MFB", code: "50871", usesNuban: true },
  { name: "UNILAG MICROFINANCE BANK", code: "51316", usesNuban: true },
  { name: "UZONDU MICROFINANCE BANK AWKA ANAMBRA STATE", code: "50894", usesNuban: true },
  { name: "WAYA MICROFINANCE BANK", code: "51355", usesNuban: true },
  { name: "ASTRAPOLARIS MFB LTD", code: "50094", usesNuban: true },

  // Payment Service Banks (6-digit codes) - Use phone numbers as account numbers
  { name: "9MOBILE 9PAYMENT SERVICE BANK", code: "120001", usesNuban: false },
  { name: "AIRTEL SMARTCASH PSB", code: "120004", usesNuban: false },
  { name: "HOPE PSB", code: "120002", usesNuban: false },
  { name: "MTN MOMO PSB", code: "120003", usesNuban: false },
  { name: "PALMPAY", code: "999991", usesNuban: false },
  { name: "OPAY DIGITAL SERVICES LIMITED (OPAY)", code: "999992", usesNuban: false },
  { name: "MONEY MASTER PSB", code: "946", usesNuban: false },

  // Digital Payment Platforms - Use NUBAN
  { name: "PAGA", code: "100002", usesNuban: true },
  { name: "GOMONEY", code: "100022", usesNuban: true },
  { name: "KONGAPAY", code: "100025", usesNuban: true },
  { name: "PARKWAY", code: "100028", usesNuban: true },
  { name: "PARKWAY - READYCASH", code: "311", usesNuban: true },
  { name: "PREMIUM TRUST BANK", code: "100032", usesNuban: true },
  { name: "PAYSTACK-TITAN", code: "100039", usesNuban: true },

  // Mortgage Banks - Use NUBAN
  { name: "ABBEY MORTGAGE BANK", code: "404", usesNuban: true },
  { name: "ASO SAVINGS AND LOANS", code: "401", usesNuban: true },
  { name: "AG MORTGAGE BANK", code: "90077", usesNuban: true },
  { name: "IMPERIAL HOMES MORTGAGE BANK", code: "415", usesNuban: true },
  { name: "CITYCODE MORTAGE BANK", code: "070027", usesNuban: true },
  { name: "LAGOS BUILDING INVESTMENT COMPANY PLC.", code: "90052", usesNuban: true },
  { name: "LIVING TRUST MORTGAGE BANK", code: "031", usesNuban: true },
  { name: "FIRSTTRUST MORTGAGE BANK NIGERIA", code: "413", usesNuban: true },
  { name: "GATEWAY MORTGAGE BANK LTD", code: "812", usesNuban: true },
  { name: "REFUGE MORTGAGE BANK", code: "90067", usesNuban: true },
  { name: "PLATINUM MORTGAGE BANK", code: "268", usesNuban: true },

  // Merchant Banks - Use NUBAN
  { name: "CORONATION MERCHANT BANK", code: "559", usesNuban: true },
  { name: "FSDH MERCHANT BANK", code: "501", usesNuban: true },
  { name: "GREENWICH MERCHANT BANK", code: "562", usesNuban: true },
  { name: "NOVA MERCHANT BANK", code: "561", usesNuban: true },
  { name: "RAND MERCHANT BANK", code: "502", usesNuban: true },

  // Finance Companies - Use NUBAN
  { name: "BRANCH INTERNATIONAL FINANCIAL SERVICES LIMITED", code: "40163", usesNuban: true },
  { name: "COUNTY FINANCE LIMITED", code: "40128", usesNuban: true },
  { name: "PFI FINANCE COMPANY LIMITED", code: "050021", usesNuban: true },
  { name: "PROSPERIS FINANCE LIMITED", code: "050023", usesNuban: true },
  { name: "VALE FINANCE LIMITED", code: "050020", usesNuban: true },
  { name: "SAGE GREY FINANCE LIMITED", code: "40165", usesNuban: true },
  { name: "POCKET APP", code: "00716", usesNuban: true }
];

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

module.exports = {
  getAccountBanks: (req, res, next) => {
    let accountNumber = req.params.account;

    // Check if account number looks like a phone number
    const looksLikePhoneNumber = isPhoneNumber(accountNumber);

    // Get NUBAN matches (only from banks that use NUBAN)
    let nubanMatches = [];
    banks.forEach((item) => {
      if (item.usesNuban && isBankAccountValid(accountNumber, item.code)) {
        nubanMatches.push(item);
      }
    });

    // Build response with hybrid results
    const response = {
      accountNumber,
      isPhoneNumber: looksLikePhoneNumber,
      phoneNumber: looksLikePhoneNumber ? reconstructPhoneNumber(accountNumber) : null,
      nubanMatches,
      phoneMatches: looksLikePhoneNumber ? phoneNumberBanks : []
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
