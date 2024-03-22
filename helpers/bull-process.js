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

bullQueue.process(async (job) => {
  const {
    data: { workspaceId },
  } = job;

  const db = await connectToDb();

  const insertContact = async (workspaceId, { name }) => {
    const queryInsertContact =
      "INSERT INTO contacts (workspace_id, name) VALUES ($1, $2) RETURNING *";

    try {
      const values = [workspaceId, name];
      const { rows } = await db.query(queryInsertContact, [...values]);
      if (rows.length) {
        return rows[0];
      }
    } catch (err) {
      console.log("insert err", err);
      throw new Error(err.message);
    }
  };

  try {
    await xero.updateTenants(false);

    const activeTenantId = xero.tenants[0].tenantId;

    const contactsResponse = await xero.accountingApi.getContacts(
      activeTenantId
    );

    if (contactsResponse.body.contacts.length) {
      const promises = contactsResponse.body.contacts.map((contact) =>
        insertContact(workspaceId, contact)
      );

      return Promise.all(promises);
    }
  } catch (err) {
    console.log("err", err);
    throw new Error(err.message);
  }
});

bullQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed.`);
});

module.exports = bullQueue;
