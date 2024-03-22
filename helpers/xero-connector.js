"use strict";

require("dotenv").config();
const { XeroClient } = require("xero-node");

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUris: [`${process.env.XERO_REDIRECT_URI}`],
  scopes: process.env.XERO_SCOPES.split(" "),
  state: process.env.XERO_STATE, // custom params (optional)
});

module.exports = xero;
