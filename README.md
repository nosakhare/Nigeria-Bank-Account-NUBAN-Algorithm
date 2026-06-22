# NUBAN Validator & Generator

> A modern Node.js API for validating, predicting, and generating Nigerian Uniform Bank Account Numbers (NUBAN) based on CBN standards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

## Overview

This REST API implements the Central Bank of Nigeria's (CBN) NUBAN algorithm for validating and generating 10-digit bank account numbers. Given an account number alone, it predicts the bank(s) it could belong to, ranks them by likelihood, and detects when an "account number" is actually a phone number used by a Payment Service Bank. It ships with **176 Nigerian financial institutions** loaded from an editable data file.

### What is NUBAN?

NUBAN (Nigerian Uniform Bank Account Number) is a standard 10-digit account number format implemented by the CBN to enable seamless electronic payments across all Nigerian banks. The last digit is a **check digit** mathematically derived from the bank code and the 9-digit serial — which is what makes bank prediction from an account number possible.

## Key Features

- ✅ **Bank prediction** — given a 10-digit account number, returns every bank whose check digit matches
- ✅ **Confidence ranking** — each match carries a score combining bank popularity *and* the account number's own prefix signal
- ✅ **Prefix → issuer signal** — known issuing ranges (e.g. Kuda, Moniepoint) boost the right bank as a tiebreaker among equally-valid matches
- ✅ **Resilient name matching** — ranking is decoupled from exact-string bank names, so a casing/punctuation edit no longer silently drops a bank's score
- ✅ **Configurable bank registry** — the bank list lives in `data/banks.json` and can be swapped at runtime via an env var; no code edit required
- ✅ **NUBAN generation** — build a valid 10-digit account number from a serial + bank code
- ✅ **Phone-number detection** — recognizes phone numbers used by PSBs (PalmPay, OPay, MTN MoMo, Airtel SmartCash) and returns them separately
- ✅ **Multi-code support** — 3-digit (commercial), 5-digit (microfinance), and 6-digit (PSB) CBN codes
- ✅ **Well tested** — 21 tests covering the algorithm, ranking, prefix boosts, and endpoints

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nosakhare/Nigeria-Bank-Account-NUBAN-Algorithm.git
cd Nigeria-Bank-Account-NUBAN-Algorithm

# Install dependencies
npm install

# Start the server
node server.js
```

The API will be available at `http://localhost:3000`.

### Prerequisites

- Node.js v14.0.0 or higher
- npm

## API Reference

### 1. Predict banks for an account number

Returns every bank where a given 10-digit account number is a valid NUBAN, ranked by confidence (highest first). If the account number looks like a Nigerian phone number, the relevant Payment Service Banks are returned in `phoneMatches`.

**Use case**: reduce a 200+ bank selection list to a handful of ranked options after a user types their account number — especially valuable for USSD interfaces with limited screen space.

**Endpoint:**
```
GET /accounts/{10-digit-account-number}/banks
```

**Example — NUBAN account:**
```bash
curl http://localhost:3000/accounts/4000675874/banks
```

```json
{
  "accountNumber": "4000675874",
  "isPhoneNumber": false,
  "phoneNumber": null,
  "nubanMatches": [
    { "name": "MONIEPOINT MICROFINANCE BANK", "code": "50515", "usesNuban": true, "confidence": 490 },
    { "name": "GUARANTY TRUST BANK", "code": "058", "usesNuban": true, "confidence": 430 },
    { "name": "FIDELITY BANK", "code": "070", "usesNuban": true, "confidence": 380 },
    { "name": "PAGA", "code": "100002", "usesNuban": true, "confidence": 340 }
  ],
  "phoneMatches": [],
  "totalMatches": 18
}
```

**Example — prefix signal (Kuda account starting `110`):**
```bash
curl http://localhost:3000/accounts/1100000129/banks
```

```json
{
  "accountNumber": "1100000129",
  "isPhoneNumber": false,
  "phoneNumber": null,
  "nubanMatches": [
    { "name": "KUDA BANK", "code": "50211", "usesNuban": true, "confidence": 720 },
    { "name": "UNITY BANK", "code": "215", "usesNuban": true, "confidence": 210 },
    { "name": "LOTUS BANK", "code": "303", "usesNuban": true, "confidence": 140 }
  ],
  "phoneMatches": [],
  "totalMatches": 23
}
```

Kuda's confidence is `720` = `470` (popularity) + `250` (prefix boost, because the account starts with a Kuda issuing prefix), lifting it above other equally-valid matches.

**Example — phone-number account:**
```bash
curl http://localhost:3000/accounts/8031234567/banks
```

```json
{
  "accountNumber": "8031234567",
  "isPhoneNumber": true,
  "phoneNumber": "08031234567",
  "nubanMatches": [],
  "phoneMatches": [
    { "name": "OPAY DIGITAL SERVICES LIMITED (OPAY)", "code": "999992", "usesNuban": false, "confidence": 1500 },
    { "name": "PALMPAY", "code": "999991", "usesNuban": false, "confidence": 1480 },
    { "name": "9MOBILE 9PAYMENT SERVICE BANK", "code": "120001", "usesNuban": false, "confidence": 1310 }
  ],
  "totalMatches": 7
}
```

**Response model**

| Field | Description |
|-------|-------------|
| `accountNumber` | The 10-digit account number queried |
| `isPhoneNumber` | `true` if the number matches a Nigerian mobile prefix |
| `phoneNumber` | Reconstructed 11-digit phone number (leading `0`) when `isPhoneNumber` is true, else `null` |
| `nubanMatches` | Banks whose check digit matches, sorted by `confidence` desc. Each: `{ name, code, usesNuban: true, confidence }` |
| `phoneMatches` | Payment Service Banks (phone-based). Only populated when `isPhoneNumber` is true. Each: `{ name, code, usesNuban: false, confidence }` |
| `totalMatches` | `nubanMatches.length + phoneMatches.length` |

### 2. Generate an account number

Generates a valid 10-digit NUBAN from a serial number (≤ 9 digits, left zero-padded) and a bank code.

**Endpoint:**
```
POST /banks/{bank-code}/accounts
Content-Type: application/json

{ "serialNumber": "string" }
```

**Example:**
```bash
curl -X POST http://localhost:3000/banks/058/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "1656322"}'
```

```json
{
  "serialNumber": "001656322",
  "nuban": "0016563228",
  "bankCode": "058",
  "bank": { "name": "GUARANTY TRUST BANK", "code": "058", "usesNuban": true }
}
```

**Validation:** the bank code must be 3–6 digits and must exist in the registry; the serial must be a string of 1–9 digits. Banks with `usesNuban: false` (PSBs) are rejected — their account numbers are phone numbers and cannot be generated.

## How Ranking Works

Each candidate bank gets a `confidence` score, summed from up to three signals:

| Signal | Points | When |
|--------|--------|------|
| **PSB phone boost** | +1000 | Account looks like a phone number and the bank is a PSB |
| **Popularity** | 50–500 | Bank is in the top-50-by-transaction-volume table |
| **Type base score** | 5–40 | Bank not in the popularity table (40 commercial / 20 MFB / 10 PSB / 5 other) |
| **Prefix boost** | +250 | Account number starts with one of the bank's known issuing prefixes |

### Prefix → issuer signal

Some banks issue NUBAN serials in known leading-digit ranges, so the account number's own prefix disambiguates when several banks all produce a valid check digit. Configured in `routes/nuban_util.js`:

| Bank | Account prefixes |
|------|-----------------|
| **Kuda Bank** | `110`, `20`, `30`, `70` |
| **Moniepoint MFB** | `56`, `54`, `81`, `50`, `53`, `55`, `82`, `63`, `58`, `57`, `59`, `65`, `90` |

The boost is a **bounded tiebreaker** (`PREFIX_BOOST = 250`), not a hard override: it reorders already-valid matches but never forces a match the check-digit math rejects. The `2`-digit Kuda prefixes are intentionally broad, which is why the signal nudges rather than dictates.

### Resilient name matching

Popularity and prefix lookups are keyed on a **normalized** bank name (`normalizeName()` — uppercase, collapse non-alphanumerics to single spaces, trim) rather than the exact string. This means a casing, punctuation, or whitespace edit to a bank name in the registry no longer silently drops it to the base score. Whitespace is preserved as a token boundary, so banks sharing a first word (e.g. `FIRST BANK OF NIGERIA` vs `FIRST CITY MONUMENT BANK`) stay distinct.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `PORT` | `3000` | HTTP port |
| `NUBAN_BANKS_PATH` | `data/banks.json` | Path (absolute or relative) to the bank registry JSON. Override to use a custom or updated bank list without editing code. |

```bash
# Run with a custom bank list
NUBAN_BANKS_PATH=/path/to/my-banks.json node server.js
```

The registry file is a JSON array of `{ "name": string, "code": string, "usesNuban": boolean }` objects.

## How the NUBAN Algorithm Works

### NUBAN Format

A NUBAN follows this structure: **ABC-DEFGHIJKL-M**

- **ABC** (or ABCDEF): Bank code assigned by CBN
  - 3 digits for commercial banks (e.g., `058` for GTBank)
  - 5 digits for microfinance banks (e.g., `50515` for Moniepoint)
  - 6 digits for payment service banks (e.g., `999991` for PalmPay)
- **DEFGHIJKL**: 9-digit account serial number
- **M**: Check digit for validation

### Algorithm Details

**Weight arrays:**
- Bank code weights: `[3, 7, 3, 3, 7, 3]` (6 digits)
- Serial number weights: `[3, 7, 3, 3, 7, 3, 3, 7, 3]` (9 digits)

**Bank code padding:**
- 3-digit codes → prefix with `"000"` → `058` → `000058`
- 5-digit codes → prefix with `"9"` → `50515` → `950515`
- 6-digit codes → use as-is → `999991`

**Calculation:**
1. Pad bank code to 6 digits
2. Weighted sum of bank code: `Σ digit[i] × weight[i]`
3. Weighted sum of serial: `Σ digit[i] × weight[i]`
4. `(bankCodeSum + serialSum) % 10`
5. Check digit = `10 - remainder`, or `0` if the result is `10`

### Example Calculation

**Account:** `4000675874` for **Moniepoint** (`50515`)

```
Serial Number: 400067587
Bank Code: 50515 → Padded: 950515

Bank Code Weighted Sum:
9×3 + 5×7 + 0×3 + 5×3 + 1×7 + 5×3 = 99

Serial Number Weighted Sum:
4×3 + 0×7 + 0×3 + 0×3 + 6×7 + 7×3 + 5×3 + 8×7 + 7×3 = 167

Total: 99 + 167 = 266
266 % 10 = 6
Check Digit: 10 - 6 = 4 ✓ (matches last digit!)
```

## Supported Banks

176 institutions across commercial banks, microfinance banks, payment service banks, mortgage banks, merchant banks, finance companies, and digital payment platforms.

| Category | Examples |
|----------|----------|
| **Commercial Banks** | Access Bank, GTBank, Zenith Bank, First Bank, UBA, Wema |
| **Microfinance Banks** | Kuda Bank, Moniepoint, Carbon, FairMoney, VFD, Sparkle |
| **Payment Service Banks** | PalmPay, OPay, MTN MoMo PSB, Airtel SmartCash PSB |
| **Merchant Banks** | FSDH, Nova, Coronation, Greenwich, Rand Merchant |
| **Mortgage Banks** | Abbey Mortgage Bank, AG Mortgage, Living Trust |
| **Finance Companies** | Branch International, Prosperis Finance, Vale Finance |
| **Digital Platforms** | Paga, GoMoney, KongaPay, Parkway, Pocket App |

The full list lives in [data/banks.json](data/banks.json).

### Phone-number detection prefixes

A 10-digit account is treated as a phone number if it starts with a known mobile prefix:

- **MTN**: 803, 806, 703, 706, 813, 816, 810, 814, 903, 906, 913, 916
- **Airtel**: 802, 808, 708, 812, 701, 902, 901, 907, 912
- **Globacom (Glo)**: 805, 807, 705, 815, 811, 905, 915
- **9mobile**: 809, 817, 818, 908, 909

## Testing

```bash
# Full test suite (node:test)
npm test

# Inspect every match for a single account number
node test_any_account.js 4000675874
```

## Project Structure

```
Nigeria-Bank-Account-NUBAN-Algorithm/
├── server.js                         # Express server entry point
├── package.json                      # Dependencies and metadata
├── data/
│   └── banks.json                    # Editable bank registry (176 banks)
├── routes/
│   └── nuban_util.js                 # NUBAN algorithm, ranking, prefix signals
├── test_any_account.js               # CLI: inspect matches for an account
├── test_updated_implementation.js    # Test suite
└── README.md                         # This file
```

## Known Limitations

1. **Multiple matches by design** — the same serial with different bank codes can yield the same check digit, so an account can be valid for several banks. Ranking narrows it; the user still confirms their bank.
2. **PSBs don't use NUBAN** — PSB account numbers are phone numbers, validated/returned separately (`phoneMatches`), not via the check-digit sweep.
3. **CBN codes ≠ NIP codes** — this uses CBN bank codes for NUBAN validation; NIBSS NIP codes (interbank transfers) are a different numbering system.
4. **Prefix signal is heuristic** — issuing-range prefixes (Kuda, Moniepoint) are a bounded tiebreaker, best tuned with real transaction data via the `PREFIX_BOOST` constant and the prefix map.
5. **Registry currency** — Nigeria's banking sector evolves; newly licensed institutions can be added by editing `data/banks.json` (or pointing `NUBAN_BANKS_PATH` at your own list).

## How do I add or update a bank?

Edit [data/banks.json](data/banks.json) — no code change needed:

```json
{ "name": "NEW BANK NAME", "code": "123", "usesNuban": true }
```

Use `usesNuban: false` for phone-based PSBs. To rank a bank or give it a prefix signal, add it to `bankPopularity` / `issuerPrefixesByBank` in [routes/nuban_util.js](routes/nuban_util.js).

## Standards & References

- [CBN NUBAN Original Specification (2010)](https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF)
- [CBN Revised NUBAN Standards (March 2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- [03balogun NUBAN Implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm) — algorithm reference
- [Blockroll nuban-prediction](https://github.com/Blockroll-Tech/nuban-bank-prediction) — source of the Moniepoint prefix ranges

## Changelog

### v2.1 — Ranking & configurability

- **Prefix → issuer ranking**: account-number prefixes now boost the matching issuer (Kuda `110/20/30/70`, Moniepoint ranges) as a bounded tiebreaker
- **Resilient name matching**: ranking lookups normalized so name casing/punctuation edits don't silently drop a bank's score
- **Configurable registry**: bank list moved to `data/banks.json`, overridable via `NUBAN_BANKS_PATH`
- **Tests**: added coverage for prefix boosts and the no-boost case

### v2.0 — Major overhaul

- Replaced the original single 12-digit seed with separate weighted arrays (per [03balogun](https://github.com/03balogun/nuban-bank-prediction-algorithm) and CBN 2020 Revised Standards)
- Added 5- and 6-digit code support (microfinance, PSB)
- Expanded from 22 commercial banks to 176 institutions of all types
- Added phone-number detection and confidence scoring
- Migrated the server from Restify to Express

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- Original algorithm implementation: Hafiz Adewuyi
- Algorithm upgrade inspired by [03balogun's implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)
- Moniepoint prefix ranges adapted from [Blockroll's nuban-prediction](https://github.com/Blockroll-Tech/nuban-bank-prediction)
- Central Bank of Nigeria for the NUBAN specifications

---

**⚠️ Disclaimer**: This is a validation/prediction tool only. Always verify account details with the actual bank before making financial transactions. Not affiliated with the Central Bank of Nigeria or any financial institution.
