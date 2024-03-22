require("dotenv").config();
const xero = require("../helpers/xero-connector");
const bullQueue = require("../helpers/bull-process");

/**
 * Adding of job to queue
 *
 * @param {*} req
 * @param {*} res
 */
exports.processContacts = async (req, res) => {
  const { query, session } = req;

  try {
    if (!session?.tokenSet || !query?.workspace_id) {
      throw new Error("No data found");
    }

    await xero.setTokenSet(session.tokenSet);

    const job = await bullQueue.add({ workspaceId: query.workspace_id });
    console.log(`Adding job ${job.id} to the queue`);

    const result = await job.finished();

    return res.status(200).json({ message: "Successfully added", result });
  } catch (err) {
    console.log("processContacts err", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
