"use strict";

require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  connectionString: process.env.POSTGRES_URI,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

let clientInstance;

function connectToDb() {
  if (!clientInstance) {
    try {
      client.connect();
      clientInstance = client;
      console.log("DB connection was established");
    } catch (e) {
      console.error("connection error", e.stack);
    }
  }
  return clientInstance;
}

module.exports = connectToDb;
