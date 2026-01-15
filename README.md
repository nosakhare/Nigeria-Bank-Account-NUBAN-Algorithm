# NUBAN (Nigerian Uniform Bank Account Number) Algorithm

Modern implementation of the NUBAN algorithm for generating and validating Nigerian bank account numbers. This implementation is based on the [CBN Revised Standards (March 2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf) and supports all Nigerian financial institutions including commercial banks, microfinance banks, payment service banks, and digital payment platforms.

## Features ✨

- ✅ **Comprehensive Bank Coverage**: 62 Nigerian banks including commercial, microfinance, payment service, mortgage, and merchant banks
- ✅ **Modern Algorithm**: Based on [03balogun's implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm) with CBN 2020 standards
- ✅ **Multi-Code Support**: Handles 3-digit, 5-digit, and 6-digit CBN bank codes
- ✅ **Fintech Ready**: Supports Moniepoint, Kuda, Carbon, FairMoney, PalmPay, OPay, and other digital banks
- ✅ **RESTful API**: Easy-to-use endpoints for validation and generation
- ✅ **Well Tested**: Comprehensive test suite included

## Bank Coverage

### Commercial Banks (27)
Access Bank, Citibank, Ecobank, Fidelity Bank, First Bank, FCMB, Globus Bank, GTBank, Heritage Bank, Jaiz Bank, Keystone Bank, Lotus Bank, Parallex Bank, Polaris Bank, Providus Bank, Stanbic IBTC, Standard Chartered, Sterling Bank, Suntrust Bank, Taj Bank, Titan Trust Bank, Union Bank, UBA, Unity Bank, Wema Bank, Zenith Bank

### Microfinance Banks (16)
Carbon, Eyowo, FairMoney, Kuda Bank, Moniepoint, Sparkle, VFD, Rubies, Accion, Baobab, Consumer, Grooming, Hackman, Ibile, Mint, Tangerine

### Payment Service Banks (5)
9Mobile 9PSB, Airtel SmartCash PSB, Hope PSB, MTN MoMo PSB, PalmPay

### Digital Payment Platforms (5)
Paga, GoMoney, KongaPay, Parkway, Premium Trust Bank

### Mortgage Banks (4)
Abbey Mortgage Bank, AG Mortgage Bank, Imperial Homes, Living Trust

### Merchant Banks (5)
Coronation, FSDH, Greenwich, Nova, Rand Merchant Bank

## Setting Up

### Prerequisites
- Node.js (v14.0.0 or higher recommended)
- npm

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

The server will start on `http://localhost:3000` by default.

## API Endpoints

### 1. **Get Account Banks**

Given any 10-digit Nigerian bank account number, this endpoint returns a JSON array of banks where that account number could be valid.

**Use Case**: A common application of this algorithm in Nigeria is to reduce the bank selection list from 60+ banks to 3-5 options after a user enters their account number. This is especially useful for USSD interfaces with limited screen space.

**Specification**

```
GET /accounts/{10-digit-NUBAN}/banks
```

**Sample Request**

```bash
curl http://localhost:3000/accounts/4000675874/banks
```

**Sample Response**

```json
[
  {
    "name": "FIDELITY BANK",
    "code": "070"
  },
  {
    "name": "GUARANTY TRUST BANK",
    "code": "058"
  },
  {
    "name": "MONIEPOINT MICROFINANCE BANK",
    "code": "50515"
  }
]
```

**Bank Model**

- `name`: The name of the Nigerian bank
- `code`: The CBN unique identifier for the bank (3, 5, or 6 digits)

### 2. **Generate Bank Account**

Given any 9-digit number (account serial number) and a Nigerian bank code, this endpoint returns the full 10-digit account number with the calculated check digit.

**Specification**

```
POST /banks/{bank-code}/accounts
Content-Type: application/json

{
  "serialNumber": "string"
}
```

**Note**: `serialNumber` should be 9 digits or less. If less than 9 digits, it will be left zero-padded.

**Sample Request - Commercial Bank (3-digit code)**

```bash
curl -X POST http://localhost:3000/banks/058/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "1656322"}'
```

**Sample Response**

```json
{
  "serialNumber": "001656322",
  "nuban": "0016563228",
  "bankCode": "058",
  "bank": {
    "name": "GUARANTY TRUST BANK",
    "code": "058"
  }
}
```

**Sample Request - Microfinance Bank (5-digit code)**

```bash
curl -X POST http://localhost:3000/banks/50515/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "1656322"}'
```

**Sample Response**

```json
{
  "serialNumber": "001656322",
  "nuban": "0016563228",
  "bankCode": "50515",
  "bank": {
    "name": "MONIEPOINT MICROFINANCE BANK",
    "code": "50515"
  }
}
```

## Testing

Several test scripts are included to demonstrate and verify the implementation:

### Test Any Account Number

```bash
node test_any_account.js <account-number>
```

Example:
```bash
node test_any_account.js 4000675874
```

This shows a comparison between the old and new implementations, highlighting banks that can now be detected.

### Test Updated Implementation

```bash
node test_updated_implementation.js
```

Runs comprehensive tests on the updated algorithm with multiple account numbers.

### Test NIP vs CBN Codes

```bash
node test_nip_codes.js
```

Demonstrates the difference between NIP codes (used for interbank transfers) and CBN codes (used for NUBAN validation).

## Algorithm Details

### The NUBAN Format

A NUBAN is structured as: **ABC-DEFGHIJKL-M**

- **ABC** (or ABCDEF): Bank code assigned by CBN
  - 3 digits for commercial banks (e.g., 058 for GTBank)
  - 5 digits for microfinance banks/OFIs (e.g., 50515 for Moniepoint)
  - 6 digits for payment service banks (e.g., 999991 for PalmPay)
- **DEFGHIJKL**: 9-digit account serial number
- **M**: Check digit for validation

### Check Digit Calculation

The algorithm uses weighted multiplication:

1. **Bank Code Weights**: `[3, 7, 3, 3, 7, 3]` (6 digits after padding)
2. **Serial Number Weights**: `[3, 7, 3, 3, 7, 3, 3, 7, 3]` (9 digits)

**Bank Code Padding Rules**:
- 3-digit codes → Prefix with "000" → 6 digits (e.g., 058 → 000058)
- 5-digit codes → Prefix with "9" → 6 digits (e.g., 50515 → 950515)
- 6-digit codes → Use as-is (e.g., 999991 → 999991)

**Steps**:
1. Calculate weighted sum for bank code
2. Calculate weighted sum for serial number
3. Add both sums and take modulo 10
4. Check digit = 10 - (sum % 10), or 0 if result is 10

## Code Structure

```
Nigeria-Bank-Account-NUBAN-Algorithm/
├── index.js                          # Application entry point
├── routes/
│   ├── route_index.js               # API route definitions
│   └── nuban_util.js                # Core NUBAN algorithm (62 banks)
├── config/
│   └── config.js                    # Application configuration
├── test_account.js                  # Simple account validation test
├── test_updated_implementation.js   # Comprehensive algorithm tests
├── test_any_account.js             # Compare old vs new implementations
├── test_nip_codes.js               # NIP vs CBN code comparison
├── COMPARISON.md                    # Detailed comparison documentation
└── README.md                        # This file
```

## Comparison with Original Implementation

See [COMPARISON.md](COMPARISON.md) for a detailed comparison between this implementation and the 03balogun reference implementation.

**Key Differences from Original Version**:

| Feature | Original (2017) | Updated (2026) |
|---------|----------------|----------------|
| **Algorithm** | Single 12-digit seed | Separate weight arrays |
| **Bank Codes** | 3-digit only | 3, 5, and 6-digit |
| **Banks** | 22 commercial banks | 62 banks (all types) |
| **Microfinance** | Not supported | ✅ 16 banks |
| **PSBs** | Not supported | ✅ 5 banks |
| **Digital Platforms** | Not supported | ✅ 5 platforms |
| **CBN Standards** | 2010 Original | 2020 Revised |

## Real-World Examples

### Example 1: Moniepoint Account
```bash
curl http://localhost:3000/accounts/4000675874/banks
```
Returns: Fidelity Bank, GTBank, **Moniepoint MFB** (now detected!)

### Example 2: PalmPay Account
```bash
curl http://localhost:3000/accounts/2182813377/banks
```
Returns: Access Bank, First Bank, UBA, **PalmPay** (now detected!)

### Example 3: Generate Kuda Account
```bash
curl -X POST http://localhost:3000/banks/50211/accounts \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "123456789"}'
```
Generates valid Kuda Bank account number

## Standards & References

- [CBN NUBAN Original Specification (2010)](https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF)
- [CBN Revised NUBAN Standards (2020)](https://www.cbn.gov.ng/out/2020/psmd/revised%20standards%20on%20nigeria%20uniform%20bank%20account%20number%20(nuban)%20for%20banks%20and%20other%20financial%20institutions%20.pdf)
- [03balogun NUBAN Implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)
- [Nigerian Banks Code List](https://gist.github.com/donejeh/591f2739d986d7ae6338ea2921d03cf4)

## Known Limitations

1. **Multiple Bank Matches**: The NUBAN algorithm can return multiple banks for the same account number. This is by design - the same serial number with different bank codes can produce the same check digit. In practice, users need to select their specific bank from the returned list.

2. **Bank List Currency**: While we've expanded to 62 banks (as of 2026), Nigeria's banking sector continues to evolve. New banks and fintech providers may need to be added periodically.

3. **NIP Codes**: This implementation uses CBN bank codes for NUBAN validation. NIP codes (used for interbank transfers) are different and cannot be used for NUBAN validation. See [test_nip_codes.js](test_nip_codes.js) for details.

## Future Improvements

- [ ] Add API endpoint to list all supported banks
- [ ] Add bank name search/lookup by code
- [ ] Add bulk validation endpoint
- [ ] Add rate limiting and authentication
- [ ] Add OpenAPI/Swagger documentation
- [ ] Deploy to cloud platform (Heroku, AWS, Azure)
- [ ] Add bank logo/icon URLs to bank objects
- [ ] Implement caching for frequently queried accounts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

Areas where contributions would be particularly helpful:
- Adding newly licensed banks
- Improving test coverage
- Performance optimizations
- API documentation improvements

## License

MIT License - feel free to use this in your projects!

## Acknowledgments

- Original implementation by the repository creator
- Algorithm upgrade inspired by [03balogun's implementation](https://github.com/03balogun/nuban-bank-prediction-algorithm)
- Central Bank of Nigeria for NUBAN specifications
- Nigerian banking community for feedback and real-world testing

## Contact & Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing issues for similar questions
- Refer to [COMPARISON.md](COMPARISON.md) for technical details

---

**Note**: This is a validation tool only. Always verify account details with the actual bank before making financial transactions.
