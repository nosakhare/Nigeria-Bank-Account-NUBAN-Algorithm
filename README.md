# NUBAN Validator & Generator

> A modern Node.js API for validating and generating Nigerian Uniform Bank Account Numbers (NUBAN) based on CBN standards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

## Overview

This REST API implements the Central Bank of Nigeria's (CBN) NUBAN algorithm for validating and generating 10-digit bank account numbers. It supports **200+ Nigerian financial institutions** including commercial banks, microfinance banks, payment service banks, merchant banks, and digital payment platforms.

### What is NUBAN?

NUBAN (Nigerian Uniform Bank Account Number) is a standard 10-digit account number format implemented by the CBN to enable seamless electronic payments across all Nigerian banks. The format includes a check digit for validation purposes.

## Key Features

- ✅ **Comprehensive Bank Coverage**: 200+ Nigerian financial institutions including commercial, microfinance, payment service, mortgage, and merchant banks
- ✅ **Modern Algorithm**: Based on [03balogun's implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm) with [CBN 2020 Revised Standards](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- ✅ **Multi-Code Support**: Handles 3-digit (commercial banks), 5-digit (microfinance banks), and 6-digit (payment service banks) CBN bank codes
- ✅ **Phone Number Detection**: Automatically detects when account numbers are Nigerian phone numbers (used by Payment Service Banks)
- ✅ **Hybrid Validation**: Returns both NUBAN-valid banks and phone-number-based banks in a single response
- ✅ **Fintech Ready**: Supports Moniepoint, Kuda, Carbon, FairMoney, PalmPay, OPay, and other digital banks
- ✅ **RESTful API**: Easy-to-use endpoints for validation and generation
- ✅ **Well Tested**: Comprehensive test suite included

The implementation includes **200+ Nigerian financial institutions** across multiple categories:

### Commercial Banks (30+)
Access Bank, Access Bank (Diamond), Citibank Nigeria, Ecobank Nigeria, Fidelity Bank, First Bank of Nigeria, First City Monument Bank, Globus Bank, Guaranty Trust Bank, Heritage Bank, Jaiz Bank, Keystone Bank, Lotus Bank, Parallex Bank, Polaris Bank, Providus Bank, Stanbic IBTC Bank, Standard Chartered Bank, Sterling Bank, Suntrust Bank, Taj Bank, Titan Trust Bank, Union Bank of Nigeria, United Bank for Africa, Unity Bank, Wema Bank, Zenith Bank, Optimus Bank Limited, Signature Bank Ltd, PremiumTrust Bank, The Alternative Bank

### Microfinance Banks (100+)
Popular digital banks: Carbon, Eyowo, FairMoney Microfinance Bank, Kuda Bank, Moniepoint Microfinance Bank, Sparkle Microfinance Bank, VFD Microfinance Bank, Rubies MFB

Other notable MFBs: Accion, Baobab, Consumer, Grooming, Hackman, Ibile, Mint, Tangerine, Above Only, Abulesoro, Aella, Ahmadu Bello University MFB, Aku, Amegy, Amju Unique, Ampersand, Aramoko, Avuenegbe, Awacash, Bainescredit, Banc Corp, Bellbank, Benysta, Beststar, Bowen, Cashbridge, Cashconnect, CEMCS, Chanelle, Chikum, Corestep, Crescent, Crust, Davenport, Dot, Ekimogun, Ekondo, Excel Finance, Fedeth, Firmus, First Royal, Futminna, Goldman, Good Shepherd, GoodNews, Hasal, Ibank, Ikoyi Osun, Ilaro Poly, Imowo, Infinity, Isua, Kadpoly, Kanopoly, Kredi Money, Links, Loma, Mainstreet, Mayfair, Mutual Benefits, NDCC, Net, Nigerian Navy MFB, NPF, Pathfinder, Peace, Pecantrust, Personal Trust, Petra, Polyunwana, Quickfund, Randalpha, Rehoboth, Rephidim, Rigo, Rockshield, Safe Haven, Shield, Solid Allianze, Solid Rock, Stanford, Stateside, Stellas, Supreme, Transpay, U&C, Ucee, Uhuru, UNAAB, UNICAL, UNILAG, Uzondu, Waya, Astrapolaris, and more.

### Payment Service Banks (7)
These banks use phone numbers as account numbers instead of NUBAN:
- 9Mobile 9Payment Service Bank
- Airtel SmartCash PSB
- Hope PSB
- MTN MoMo PSB
- PalmPay
- OPay Digital Services Limited
- Money Master PSB

### Digital Payment Platforms (7)
Paga, GoMoney, KongaPay, Parkway, Parkway - ReadyCash, Premium Trust Bank, Paystack-Titan

### Mortgage Banks (11)
Abbey Mortgage Bank, Aso Savings and Loans, AG Mortgage Bank, Imperial Homes Mortgage Bank, Citycode Mortgage Bank, Lagos Building Investment Company PLC, Living Trust Mortgage Bank, FirstTrust Mortgage Bank Nigeria, Gateway Mortgage Bank Ltd, Refuge Mortgage Bank, Platinum Mortgage Bank

### Merchant Banks (5)
Coronation Merchant Bank, FSDH Merchant Bank, Greenwich Merchant Bank, Nova Merchant Bank, Rand Merchant Bank

### Finance Companies (7)
Branch International Financial Services Limited, County Finance Limited, PFI Finance Company Limited, Prosperis Finance Limited, Vale Finance Limited, Sage Grey Finance Limited, Pocket App

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

Given any 10-digit Nigerian bank account number, this endpoint returns a comprehensive response including:
- NUBAN-valid banks (banks where the account number passes NUBAN validation)
- Phone number detection (if the account number appears to be a Nigerian phone number)
- Phone-number-based banks (Payment Service Banks that use phone numbers as account numbers)

**Use Case**: A common application of this algorithm in Nigeria is to reduce the bank selection list from 200+ banks to 3-5 options after a user enters their account number. This is especially useful for USSD interfaces with limited screen space. The phone number detection feature is particularly useful for Payment Service Banks like PalmPay, OPay, MTN MoMo, and Airtel SmartCash.

**Endpoint:**
```
GET /accounts/{10-digit-account-number}/banks
```

**Example Request (NUBAN Account):**
```bash
curl http://localhost:3000/accounts/4000675874/banks
```

**Example Response (NUBAN Account):**
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

**Example Request (Phone Number Account):**
```bash
curl http://localhost:3000/accounts/8031234567/banks
```

**Example Response (Phone Number Account):**
```json
{
  "accountNumber": "8031234567",
  "isPhoneNumber": true,
  "phoneNumber": "08031234567",
  "nubanMatches": [],
  "phoneMatches": [
    {
      "name": "9MOBILE 9PAYMENT SERVICE BANK",
      "code": "120001",
      "usesNuban": false
    },
    {
      "name": "AIRTEL SMARTCASH PSB",
      "code": "120004",
      "usesNuban": false
    },
    {
      "name": "HOPE PSB",
      "code": "120002",
      "usesNuban": false
    },
    {
      "name": "MTN MOMO PSB",
      "code": "120003",
      "usesNuban": false
    },
    {
      "name": "PALMPAY",
      "code": "999991",
      "usesNuban": false
    },
    {
      "name": "OPAY DIGITAL SERVICES LIMITED (OPAY)",
      "code": "999992",
      "usesNuban": false
    },
    {
      "name": "MONEY MASTER PSB",
      "code": "946",
      "usesNuban": false
    }
  ]
}
```

**Response Model**

- `accountNumber`: The 10-digit account number queried
- `isPhoneNumber`: Boolean indicating if the account number matches a Nigerian phone number pattern
- `phoneNumber`: The reconstructed 11-digit phone number (with leading 0) if `isPhoneNumber` is true, otherwise null
- `nubanMatches`: Array of banks where the account number passes NUBAN validation. Each bank object contains:
  - `name`: The name of the Nigerian bank
  - `code`: The CBN unique identifier for the bank (3, 5, or 6 digits)
  - `usesNuban`: Always `true` for NUBAN matches
- `phoneMatches`: Array of Payment Service Banks that use phone numbers as account numbers. Only populated when `isPhoneNumber` is true. Each bank object contains:
  - `name`: The name of the Payment Service Bank
  - `code`: The CBN unique identifier for the bank
  - `usesNuban`: Always `false` for phone-number-based banks

**Phone Number Detection**

The system automatically detects Nigerian phone numbers by checking if the 10-digit account number starts with known mobile network prefixes:
- **MTN**: 803, 806, 703, 706, 813, 816, 810, 814, 903, 906, 913, 916
- **Airtel**: 802, 808, 708, 812, 701, 902, 901, 907, 912
- **Globacom (Glo)**: 805, 807, 705, 815, 811, 905, 915
- **9mobile**: 809, 817, 818, 908, 909

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

**Note**: 
- `serialNumber` should be 9 digits or less. If less than 9 digits, it will be left zero-padded.
- Currently, the endpoint only accepts 3-digit bank codes in the URL path. However, the underlying algorithm supports 3-digit, 5-digit, and 6-digit codes. To generate accounts for banks with 5 or 6-digit codes, you can use the algorithm directly in your code.

**Example Request (Commercial Bank - 3-digit code):**
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

**Example Request (Microfinance Bank - 5-digit code):**
```bash
curl -X POST http://localhost:3000/banks/50515/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "400067587"}'
```

**Note on 5 and 6-digit Bank Codes**: The POST endpoint currently only accepts 3-digit bank codes in the URL. For microfinance banks (5-digit codes) or payment service banks (6-digit codes), you would need to modify the route or use the algorithm functions directly. The algorithm itself fully supports all code lengths.

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

## Comparison with Original Implementation

See [COMPARISON.md](COMPARISON.md) for a detailed comparison between this implementation and the 03balogun reference implementation.

**Key Differences from Original Version**:

| Feature | Original (2017) | Updated (2026) |
|---------|----------------|----------------|
| **Algorithm** | Single 12-digit seed | Separate weight arrays |
| **Bank Codes** | 3-digit only | 3, 5, and 6-digit |
| **Banks** | 22 commercial banks | 200+ financial institutions (all types) |
| **Microfinance** | Not supported | ✅ 100+ banks |
| **PSBs** | Not supported | ✅ 7 banks (with phone detection) |
| **Digital Platforms** | Not supported | ✅ 7 platforms |
| **Phone Detection** | Not supported | ✅ Automatic detection |
| **CBN Standards** | 2010 Original | 2020 Revised |

## Real-World Examples

### Example 1: Moniepoint Account (NUBAN)
```bash
# Moniepoint account
curl http://localhost:3000/accounts/4000675874/banks
# Returns: Fidelity Bank, GTBank, Moniepoint MFB
```
**Response**: Returns NUBAN matches including Fidelity Bank, GTBank, and **Moniepoint MFB** (now detected with 5-digit code support!)

### Example 2: PalmPay Account (Phone Number)
```bash
curl http://localhost:3000/accounts/8031234567/banks
```
**Response**: 
- `isPhoneNumber: true`
- `phoneNumber: "08031234567"`
- `phoneMatches`: All 7 Payment Service Banks including **PalmPay**, **OPay**, **MTN MoMo**, etc.

This demonstrates the phone number detection feature - when a user enters a phone number as their account number, the system automatically identifies it and returns all Payment Service Banks that use phone numbers.

### Example 3: Regular Bank Account
```bash
curl http://localhost:3000/accounts/1234567890/banks
```
**Response**: Returns NUBAN matches including Access Bank, First Bank, UBA, and other banks where this account number is valid.

### Example 4: Generate GTBank Account
```bash
curl -X POST http://localhost:3000/banks/058/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "123456789"}'
```
**Response**: Generates valid GTBank account number with check digit

## Standards & References

This implementation is based on:

- [CBN NUBAN Original Specification (2010)](https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF)
- [CBN Revised NUBAN Standards (March 2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- [03balogun NUBAN Implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)

## Known Limitations

1. **Multiple Bank Matches**: The same account number can be valid for multiple banks. This is by design - the same serial number with different bank codes can produce the same check digit. Users must select their specific bank from the returned list.

2. **Phone Number vs NUBAN**: Payment Service Banks (PSBs) use phone numbers as account numbers. These don't follow NUBAN validation but are detected separately.

3. **NIP Codes vs CBN Codes**: This implementation uses CBN bank codes for NUBAN validation. NIP codes (Nigeria Interbank Settlement System) used for interbank transfers are different and cannot be used for NUBAN validation.

4. **Bank List Currency**: While we've expanded to 200+ financial institutions, Nigeria's banking sector continues to evolve. New banks and fintech providers may need to be added periodically.

5. **POST Endpoint Limitation**: The POST endpoint for generating accounts (`/banks/{bank-code}/accounts`) currently only accepts 3-digit bank codes in the URL path due to route constraints. The underlying algorithm fully supports 3, 5, and 6-digit codes. For banks with longer codes, you can use the algorithm functions directly in your code.

6. **Phone Number Detection**: Phone number detection is based on known mobile network prefixes. While this covers the major networks (MTN, Airtel, Glo, 9mobile), new prefixes or network changes may require updates.

## Phone Number Detection Feature

This implementation includes intelligent phone number detection for Payment Service Banks (PSBs). Here's how it works:

### How It Works

1. **Detection**: When a 10-digit account number is queried, the system checks if it starts with known Nigerian mobile network prefixes (MTN, Airtel, Glo, 9mobile).

2. **Reconstruction**: If detected as a phone number, the system reconstructs the full 11-digit phone number by adding a leading "0".

3. **Bank Matching**: All Payment Service Banks that use phone numbers as account numbers are returned in the `phoneMatches` array.

### Use Cases

- **USSD Banking**: Users often enter phone numbers when prompted for account numbers on USSD platforms
- **Payment Service Banks**: PSBs like PalmPay, OPay, MTN MoMo use phone numbers directly as account numbers
- **User Experience**: Reduces friction by automatically detecting phone numbers and showing relevant PSB options

### Supported Phone Prefixes

The system recognizes prefixes from all major Nigerian mobile networks:
- **MTN Nigeria**: 803, 806, 703, 706, 813, 816, 810, 814, 903, 906, 913, 916
- **Airtel Nigeria**: 802, 808, 708, 812, 701, 902, 901, 907, 912
- **Globacom (Glo)**: 805, 807, 705, 815, 811, 905, 915
- **9mobile**: 809, 817, 818, 908, 909

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
- [ ] Extend POST endpoint to support 5 and 6-digit bank codes
- [ ] Add rate limiting and API authentication
- [ ] Add OpenAPI/Swagger documentation
- [ ] Deploy to cloud platform (Heroku, AWS, Azure)
- [ ] Add bank logo URLs to responses
- [ ] Implement caching for frequently queried accounts
- [ ] Create NPM package for direct library usage
- [ ] Add webhook support for real-time validation
- [ ] Add support for additional phone number prefixes as networks evolve

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
