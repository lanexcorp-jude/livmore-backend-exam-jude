# NodeJs Exam API

This project is intended for exam purposes.

## Project Details

This API application is powered by the following technologies:

1. [ExpressJS](https://expressjs.com/) - A minimalist web framework for Node.js
2. [Bull](https://optimalbits.github.io/bull/) - A fast and robust queue system based on Redis.
3. [PostgreSQL](https://www.postgresql.org/) - A reliable, feature robust, and high performance open source object-relational database system
4. [Redis](https://redis.io/) - An in-memory data store used as a cache, document database, and message broker.

This project aims to fetch data to [Xero](https://www.xero.com/au/) API and save it to our database. Since Xero API limits the number of requests the 60, We have integrated `Bull` for queueing and rate limiting of those requests.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the necessary packages.

1. Copy the environment variables
2. Install the packages:

```
npm install
```

3. Run the development server:

```
node app.js
```

4. After the server is running, you can now access the following endpoints:

- `GET` /build-consent
- `GET` /process-contacts?workspace_id=[ID from workspaces table]

`NOTE`: `PostgreSQL Database` and `Redis` should be running in your environment for data storage and queuing. It should be connected to the application.

## Usage

1. In PostgreSQL, create the tables that will be needed:

- `workspaces` - contains the data of the workspace containing the columns `id`, and `name`.
- `contacts` - contains the data of the contact containing the columns `id`, `workspace_id` and `name`.

2. Xero API requires token upon accessing their data. Therefore, we need to request in Xero to grant our server with consent together with the selected organization for the data the we will be accessing. We can access this one through:

```
http://localhost:3000/build-consent
```

It will be redirected to Xero's consent page and after selecting the organisation, the server will be granted 30 minutes of access via token. This token will be saved on the session so that we will not access this all over again.

3. After we have acquired the token from Xero, We can now fetch their data with this endpoint `GET https://api.xero.com/api.xro/2.0/Contacts` with the equivalent of `xero.accountingApi.getContacts()` of the SDK.
   We can access the getting of contacts and storing it in our database through:

```
http://localhost:3000/process-contacts?workspace_id=e586f6a5-518e-4252-b4ea-e951ebdbdbce
```

where `workspace_id` is the ID from the `workspaces` table.

4. Each request is queued by `Bull` to ensure that it will follow the limitation provided by Xero.

## Other Details

1. Establishing database connection:

We set up connection to our database and call via function upon usage.

```
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
```

2. Establishing Xero API connection

We have used [xero-node](https://github.com/XeroAPI/xero-node) SDK in accessing Xero API. Thus, we set up connection to it and call via function upon usage.

```
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
```

3. Setting up Bull queue

We have also set up Bull queue with the following configurations to align with Xero's API requirement

```
require("dotenv").config();
const Bull = require("bull");
const xero = require("./xero-connector");
const connectToDb = require("./db-connector");

const bullQueue = new Bull("process_contacts_queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  limiter: {
    max: 60,
    duration: 1000 * 60,
  },
});
```
