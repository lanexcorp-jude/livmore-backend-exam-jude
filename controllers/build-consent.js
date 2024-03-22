const xero = require("../helpers/xero-connector");

/**
 * build Xero consent URL to obtain token
 *
 * @param {*} req
 * @param {*} res
 */
exports.buildXeroConsentUrl = async (req, res) => {
  const { query, url, session } = req;
  let tokenSet = session.tokenSet;

  await xero.initialize();

  if (tokenSet) {
    // check token if expired to obtain a new one
    await xero.setTokenSet(tokenSet);
    tokenSet = await xero.readTokenSet();

    if (tokenSet.expired()) {
      const validTokenSet = await xero.refreshToken();
      req.session.tokenSet = validTokenSet;
    }
  } else {
    if (!query.code) {
      let consentUrl = await xero.buildConsentUrl();
      return res.redirect(consentUrl);
    } else {
      // get the token from url callback after consent page and save to session
      tokenSet = await xero.apiCallback(url);
      req.session.tokenSet = tokenSet;
    }
  }

  return res.status(200).json({ message: "success" });
};
