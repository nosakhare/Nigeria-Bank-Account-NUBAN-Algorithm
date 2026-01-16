const express = require("express");
const bodyParser = require("body-parser");
const nubanUtil = require("./routes/nuban_util");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "NUBAN Validator API",
    endpoints: {
      "GET /accounts/:account/banks": "Validate account number and get matching banks",
      "POST /banks/:bank/accounts": "Generate NUBAN account number from serial number"
    }
  });
});

// Validate account number and get matching banks
app.get("/accounts/:account/banks", (req, res, next) => {
  // Validate account is 10 digits
  if (!/^\d{10}$/.test(req.params.account)) {
    return res.status(400).json({ error: "Account number must be 10 digits" });
  }
  nubanUtil.getAccountBanks(req, res, next);
});

// Generate NUBAN account number from serial number
app.post("/banks/:bank/accounts", (req, res, next) => {
  // Validate bank code is 3-6 digits
  if (!/^\d{3,6}$/.test(req.params.bank)) {
    return res.status(400).json({ error: "Bank code must be 3-6 digits" });
  }
  nubanUtil.createAccountWithSerial(req, res, next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// Start server
app.listen(port, () => {
  console.log(`NUBAN Validator API listening at http://localhost:${port}`);
});
