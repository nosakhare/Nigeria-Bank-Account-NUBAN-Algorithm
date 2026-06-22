const { test } = require("node:test");
const assert = require("node:assert/strict");
const nubanUtil = require("./routes/nuban_util.js");

const {
  getAccountBanks,
  createAccountWithSerial,
  generateCheckDigit,
  isBankAccountValid,
  isPhoneNumber,
  padBankCode,
  banks
} = nubanUtil;

// Builds a 10-digit NUBAN guaranteed valid for the given bank code, with a
// serial chosen so the account number begins with `prefix`.
const buildAccount = (bankCode, prefix) => {
  const serial = (prefix + "0".repeat(9)).slice(0, 9);
  return serial + generateCheckDigit(serial, bankCode);
};

const callHandler = (handler, req) => {
  let sent;
  let nextErr;
  const res = { send: (payload) => { sent = payload; } };
  const next = (err) => { nextErr = err; };
  handler(req, res, next);
  return { sent, nextErr };
};

test("getAccountBanks returns expected banks for known NUBANs", () => {
  const cases = [
    { account: "4000675874", expected: ["MONIEPOINT MICROFINANCE BANK", "FIDELITY BANK", "GUARANTY TRUST BANK"] },
    { account: "5822207333", expected: ["MONIEPOINT MICROFINANCE BANK", "FIDELITY BANK", "GUARANTY TRUST BANK"] },
    { account: "2182813377", expected: ["ACCESS BANK", "FIRST BANK OF NIGERIA", "UNITED BANK FOR AFRICA"] },
    { account: "1100000121", expected: ["PROVIDUS BANK", "STANDARD CHARTERED BANK", "WEMA BANK", "ZENITH BANK"] },
    { account: "0088116788", expected: ["CITIBANK NIGERIA", "STANBIC IBTC BANK", "STERLING BANK", "SUNTRUST BANK"] }
  ];

  for (const { account, expected } of cases) {
    const { sent } = callHandler(getAccountBanks, { params: { account } });
    const matched = sent.nubanMatches.map(b => b.name);
    for (const name of expected) {
      assert.ok(matched.includes(name), `${account}: expected ${name} in matches, got ${matched.join(", ")}`);
    }
  }
});

test("getAccountBanks ranks results by descending confidence", () => {
  const { sent } = callHandler(getAccountBanks, { params: { account: "2182813377" } });
  for (let i = 1; i < sent.nubanMatches.length; i++) {
    assert.ok(
      sent.nubanMatches[i - 1].confidence >= sent.nubanMatches[i].confidence,
      "nubanMatches must be sorted by confidence desc"
    );
  }
});

test("getAccountBanks flags phone-number-shaped account numbers", () => {
  const { sent } = callHandler(getAccountBanks, { params: { account: "8031234567" } });
  assert.equal(sent.isPhoneNumber, true);
  assert.equal(sent.phoneNumber, "08031234567");
  assert.ok(sent.phoneMatches.length > 0);
});

test("createAccountWithSerial generates a valid round-trip NUBAN", () => {
  const { sent, nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: { serialNumber: "1656322" }
  });
  assert.equal(nextErr, undefined);
  assert.equal(sent.nuban.length, 10);
  assert.match(sent.nuban, /^\d{10}$/);
  assert.equal(sent.serialNumber, "001656322");
  assert.equal(isBankAccountValid(sent.nuban, "058"), true);
});

test("createAccountWithSerial works for 5-digit MFB codes", () => {
  const { sent, nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "50515" },
    body: { serialNumber: "1656322" }
  });
  assert.equal(nextErr, undefined);
  assert.equal(isBankAccountValid(sent.nuban, "50515"), true);
});

test("createAccountWithSerial rejects unknown bank code with 404", () => {
  const { sent, nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "000" },
    body: { serialNumber: "1" }
  });
  assert.equal(sent, undefined);
  assert.equal(nextErr.statusCode, 404);
  assert.equal(nextErr.name, "NotFoundError");
});

test("createAccountWithSerial rejects banks with usesNuban=false", () => {
  const { sent, nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "999991" }, // PALMPAY
    body: { serialNumber: "1656322" }
  });
  assert.equal(sent, undefined);
  assert.equal(nextErr.statusCode, 400);
  assert.equal(nextErr.name, "BadRequestError");
  assert.match(nextErr.message, /does not use NUBAN/);
});

test("createAccountWithSerial rejects missing body", () => {
  const { sent, nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: undefined
  });
  assert.equal(sent, undefined);
  assert.equal(nextErr.statusCode, 400);
  assert.equal(nextErr.name, "BadRequestError");
});

test("createAccountWithSerial rejects missing serialNumber", () => {
  const { nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: {}
  });
  assert.equal(nextErr.statusCode, 400);
});

test("createAccountWithSerial rejects non-string serialNumber", () => {
  const { nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: { serialNumber: 12345 }
  });
  assert.equal(nextErr.statusCode, 400);
});

test("createAccountWithSerial rejects non-digit serialNumber", () => {
  const { nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: { serialNumber: "abc" }
  });
  assert.equal(nextErr.statusCode, 400);
});

test("createAccountWithSerial rejects empty serialNumber", () => {
  const { nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: { serialNumber: "" }
  });
  assert.equal(nextErr.statusCode, 400);
});

test("createAccountWithSerial rejects serialNumber longer than 9 digits", () => {
  const { nextErr } = callHandler(createAccountWithSerial, {
    params: { bank: "058" },
    body: { serialNumber: "1234567890" }
  });
  assert.equal(nextErr.statusCode, 400);
});

test("generateCheckDigit returns a single digit 0-9", () => {
  const d = generateCheckDigit("001656322", "058");
  assert.ok(Number.isInteger(d) && d >= 0 && d <= 9);
});

test("generateCheckDigit throws for invalid bank code length", () => {
  assert.throws(() => generateCheckDigit("000000001", "12"));
});

test("padBankCode handles 3, 5, and 6-digit codes", () => {
  assert.equal(padBankCode("058"), "000058");
  assert.equal(padBankCode("50515"), "950515");
  assert.equal(padBankCode("120001"), "120001");
});

test("isPhoneNumber detects MTN/Airtel/Glo/9mobile prefixes", () => {
  assert.equal(isPhoneNumber("8031234567"), true);
  assert.equal(isPhoneNumber("8021234567"), true);
  assert.equal(isPhoneNumber("8051234567"), true);
  assert.equal(isPhoneNumber("8091234567"), true);
  assert.equal(isPhoneNumber("1234567890"), false);
  assert.equal(isPhoneNumber("803123"), false);
  assert.equal(isPhoneNumber(""), false);
});

test("prefix boost lifts Kuda for accounts starting with a Kuda prefix", () => {
  const account = buildAccount("50211", "110"); // KUDA BANK, account starts 110
  const { sent } = callHandler(getAccountBanks, { params: { account } });
  const kuda = sent.nubanMatches.find(b => b.name === "KUDA BANK");
  assert.ok(kuda, "Kuda should be a valid check-digit match");
  // 470 popularity + 250 prefix boost
  assert.equal(kuda.confidence, 720);
  assert.equal(sent.nubanMatches[0].name, "KUDA BANK");
});

test("prefix boost lifts Moniepoint for accounts starting with a Moniepoint prefix", () => {
  const account = buildAccount("50515", "56"); // MONIEPOINT, account starts 56
  const { sent } = callHandler(getAccountBanks, { params: { account } });
  const mp = sent.nubanMatches.find(b => b.name === "MONIEPOINT MICROFINANCE BANK");
  assert.ok(mp, "Moniepoint should be a valid check-digit match");
  assert.equal(mp.confidence, 740); // 490 popularity + 250 prefix boost
});

test("no prefix boost when account does not start with a known issuer prefix", () => {
  const account = buildAccount("50211", "44"); // KUDA, account starts 44 (not a Kuda prefix)
  const { sent } = callHandler(getAccountBanks, { params: { account } });
  const kuda = sent.nubanMatches.find(b => b.name === "KUDA BANK");
  assert.ok(kuda);
  assert.equal(kuda.confidence, 470); // popularity only, no boost
});

test("banks data contains both NUBAN and non-NUBAN entries", () => {
  assert.ok(banks.some(b => b.usesNuban === true));
  assert.ok(banks.some(b => b.usesNuban === false));
  assert.ok(banks.find(b => b.code === "999991" && b.usesNuban === false));
});
