# NUBAN Validator & Generator

> A modern Node.js API for validating and generating Nigerian Uniform Bank Account Numbers (NUBAN) based on CBN standards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

## Overview

This REST API implements the Central Bank of Nigeria's (CBN) NUBAN algorithm for validating and generating 10-digit bank account numbers. It supports **200+ Nigerian financial institutions** including commercial banks, microfinance banks, payment service banks, merchant banks, and digital payment platforms.

### What is NUBAN?

NUBAN (Nigerian Uniform Bank Account Number) is a standard 10-digit account number format implemented by the CBN to enable seamless electronic payments across all Nigerian banks. The format includes a check digit for validation purposes.

## Key Features

- **Comprehensive Bank Support**: 200+ banks including Access Bank, GTBank, Zenith Bank, Kuda, Moniepoint, PalmPay, and more
- **Multi-Code Support**: Handles 3-digit (commercial banks), 5-digit (microfinance banks), and 6-digit (payment service banks) CBN codes
- **Modern Algorithm**: Based on [CBN Revised Standards (March 2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- **Phone Number Detection**: Identifies when account numbers are actually mobile phone numbers (for PSBs)
- **RESTful API**: Simple HTTP endpoints for easy integration
- **Well Tested**: Includes comprehensive test suite

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/nosakhare/Nigeria-Bank-Account-NUBAN-Algorithm.git
cd Nigeria-Bank-Account-NUBAN-Algorithm

# Install dependencies
npm install

# Start the server
node index.js
```

The API will be available at `http://localhost:3000`

### Prerequisites

- Node.js v14.0.0 or higher
- npm

## API Reference

### 1. Get Possible Banks for an Account Number

Returns all banks where a given 10-digit account number could be valid.

**Endpoint:**
```
GET /accounts/{10-digit-NUBAN}/banks
```

**Example Request:**
```bash
curl http://localhost:3000/accounts/4000675874/banks
```

**Example Response:**
```json
{
  "accountNumber": "4000675874",
  "isPhoneNumber": false,
  "phoneNumber": null,
  "nubanMatches": [
    {
      "name": "FIDELITY BANK",
      "code": "070",
      "usesNuban": true
    },
    {
      "name": "GUARANTY TRUST BANK",
      "code": "058",
      "usesNuban": true
    },
    {
      "name": "MONIEPOINT MICROFINANCE BANK",
      "code": "50515",
      "usesNuban": true
    }
  ],
  "phoneMatches": []
}
```

**Use Case:** This is commonly used to filter bank selection dropdowns in payment forms. Instead of showing 200+ banks, you can show only the 3-5 banks where the account number is valid.

### 2. Generate Account Number

Generates a valid 10-digit NUBAN account number from a 9-digit serial number and bank code.

**Endpoint:**
```
POST /banks/{bank-code}/accounts
Content-Type: application/json

{
  "serialNumber": "string"
}
```

**Example Request (Commercial Bank):**
```bash
curl -X POST http://localhost:3000/banks/058/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "1656322"}'
```

**Example Response:**
```json
{
  "serialNumber": "001656322",
  "nuban": "0016563228",
  "bankCode": "058",
  "bank": {
    "name": "GUARANTY TRUST BANK",
    "code": "058",
    "usesNuban": true
  }
}
```

**Example Request (Microfinance Bank):**
```bash
curl -X POST http://localhost:3000/banks/50515/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "400067587"}'
```

**Note:** The serial number should be 9 digits or less. If less than 9 digits, it will be automatically left zero-padded.

## Supported Banks

### By Category

| Category | Count | Examples |
|----------|-------|----------|
| **Commercial Banks** | 30+ | Access Bank, GTBank, Zenith Bank, First Bank, UBA |
| **Microfinance Banks** | 100+ | Kuda Bank, Moniepoint, Carbon, FairMoney, VFD |
| **Payment Service Banks** | 7 | PalmPay, OPay, MTN MoMo PSB, Airtel SmartCash PSB |
| **Merchant Banks** | 5 | FSDH, Nova, Coronation, Greenwich, Rand Merchant |
| **Mortgage Banks** | 10+ | Abbey Mortgage Bank, AG Mortgage, Living Trust |
| **Finance Companies** | 8+ | Branch International, Prosperis Finance, Vale Finance |
| **Digital Platforms** | 6+ | Paga, GoMoney, KongaPay, Parkway, Pocket App |

### Popular Banks

- Access Bank (044, 063)
- GTBank (058)
- Zenith Bank (057)
- First Bank (011)
- UBA (033)
- Wema Bank (035)
- Kuda Bank (50211)
- Moniepoint (50515)
- PalmPay (999991)
- OPay (999992)

[View full bank list in code](routes/nuban_util.js)

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

The algorithm uses weighted multiplication with separate weight arrays:

**Weight Arrays:**
- Bank Code Weights: `[3, 7, 3, 3, 7, 3]` (6 digits)
- Serial Number Weights: `[3, 7, 3, 3, 7, 3, 3, 7, 3]` (9 digits)

**Bank Code Padding:**
- 3-digit codes → Prefix with `"000"` → 6 digits (e.g., `058` → `000058`)
- 5-digit codes → Prefix with `"9"` → 6 digits (e.g., `50515` → `950515`)
- 6-digit codes → Use as-is (e.g., `999991` → `999991`)

**Calculation Steps:**
1. Pad bank code to 6 digits using rules above
2. Calculate weighted sum for bank code: `sum(digit[i] × weight[i])`
3. Calculate weighted sum for serial number: `sum(digit[i] × weight[i])`
4. Add both sums and take modulo 10: `(bankCodeSum + serialSum) % 10`
5. Check digit = `10 - (sum % 10)`, or `0` if result is `10`

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

## Testing

The repository includes several test scripts to verify implementation:

### Test Any Account Number
```bash
node test_any_account.js <account-number>

# Example
node test_any_account.js 4000675874
```

Shows all possible banks where the account number is valid.

### Test Updated Implementation
```bash
node test_updated_implementation.js
```

Runs comprehensive tests on multiple account numbers.

### Test Specific Bank
```bash
node test_moniepoint.js
```

Tests specific bank implementations.

### Test NIP Codes vs CBN Codes
```bash
node test_nip_codes.js
```

Demonstrates the difference between NIP codes (for transfers) and CBN codes (for NUBAN validation).

## Project Structure

```
Nigeria-Bank-Account-NUBAN-Algorithm/
├── index.js                          # Application entry point (Restify server)
├── package.json                      # Dependencies and metadata
├── config/
│   └── config.js                     # Server configuration
├── routes/
│   ├── route_index.js               # API route definitions
│   └── nuban_util.js                # Core NUBAN algorithm + bank list
├── test_account.js                   # Basic account validation test
├── test_any_account.js              # Test any account number
├── test_updated_implementation.js   # Comprehensive test suite
├── test_moniepoint.js               # Moniepoint-specific tests
├── test_nip_codes.js                # NIP vs CBN code comparison
├── verify_bank_codes_against_standard.js  # Verify against CBN standards
├── COMPARISON.md                     # Algorithm comparison documentation
└── README.md                         # This file
```

## Real-World Examples

### Example 1: Fintech Bank Detection
```bash
# Moniepoint account
curl http://localhost:3000/accounts/4000675874/banks
# Returns: Fidelity Bank, GTBank, Moniepoint MFB
```

### Example 2: Phone Number Detection
```bash
# PalmPay account (phone number format)
curl http://localhost:3000/accounts/8030123456/banks
# Detects phone number pattern and returns PSBs
```

### Example 3: Generate Kuda Account
```bash
curl -X POST http://localhost:3000/banks/50211/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "123456789"}'
# Generates valid Kuda Bank account: 1234567895
```

## Standards & References

This implementation is based on:

- [CBN NUBAN Original Specification (2010)](https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF)
- [CBN Revised NUBAN Standards (March 2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- [03balogun NUBAN Implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)

## Known Limitations

1. **Multiple Bank Matches**: The same account number can be valid for multiple banks. This is by design - the same serial number with different bank codes can produce the same check digit. Users must select their specific bank from the returned list.

2. **Phone Number vs NUBAN**: Payment Service Banks (PSBs) use phone numbers as account numbers. These don't follow NUBAN validation but are detected separately.

3. **NIP Codes vs CBN Codes**: This implementation uses CBN bank codes for NUBAN validation. NIP codes (Nigeria Interbank Settlement System) used for interbank transfers are different and cannot be used for NUBAN validation.

4. **Bank List Currency**: The Nigerian banking sector continues to evolve. New banks and fintech providers may need to be added periodically.

## Configuration

You can customize the server by setting environment variables:

```bash
# Set port (default: 3000)
export PORT=8080

# Set environment (default: development)
export NODE_ENV=production

# Set base URL (default: http://localhost:3000)
export BASE_URL=https://api.example.com

# Start server
node index.js
```

## Contributing

Contributions are welcome! Here's how you can help:

### Areas for Contribution
- Adding newly licensed banks
- Improving test coverage
- Performance optimizations
- API documentation improvements
- Adding new endpoints (bulk validation, bank search, etc.)

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Roadmap

- [ ] Add endpoint to list all supported banks
- [ ] Add bank lookup by code or name
- [ ] Implement bulk validation endpoint
- [ ] Add rate limiting and API authentication
- [ ] Add OpenAPI/Swagger documentation
- [ ] Deploy to cloud platform (Heroku, AWS, Azure)
- [ ] Add bank logo URLs to responses
- [ ] Implement caching for frequently queried accounts
- [ ] Create NPM package for direct library usage
- [ ] Add webhook support for real-time validation

## Frequently Asked Questions

### Why does my account return multiple banks?

This is expected behavior. The NUBAN algorithm can produce the same check digit for different bank codes with the same serial number. In practice, users need to select their specific bank from the list.

### What's the difference between NIP codes and CBN codes?

- **CBN Codes**: Used for NUBAN validation (this API)
- **NIP Codes**: Used for interbank transfers via NIBSS

They are different numbering systems. See [test_nip_codes.js](test_nip_codes.js) for examples.

### Can I use this for production applications?

Yes, but with caution:
- Always verify account details with the actual bank before processing payments
- This is a validation tool, not a banking verification service
- Consider implementing rate limiting and monitoring
- Keep the bank list updated

### How do I add a new bank?

Add the bank to the `banks` array in [routes/nuban_util.js](routes/nuban_util.js):

```javascript
{
  name: "NEW BANK NAME",
  code: "123",  // 3, 5, or 6 digits
  usesNuban: true  // or false for phone-based PSBs
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Original algorithm implementation: Hafiz Adewuyi
- Algorithm upgrade inspired by [03balogun's implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)
- Central Bank of Nigeria for NUBAN specifications
- Nigerian banking and fintech community for testing and feedback

## Support

- **Issues**: [GitHub Issues](https://github.com/nosakhare/Nigeria-Bank-Account-NUBAN-Algorithm/issues)
- **Discussions**: Open a GitHub Discussion for questions
- **Documentation**: See [COMPARISON.md](COMPARISON.md) for technical details

---

**⚠️ Disclaimer**: This is a validation tool only. Always verify account details with the actual bank before making financial transactions. Not affiliated with the Central Bank of Nigeria or any financial institution.

**Made with ❤️ for the Nigerian fintech community**
