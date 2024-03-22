const express = require("express");
const session = require("express-session");
const { processContacts } = require("./controllers/process-contacts");
const { buildXeroConsentUrl } = require("./controllers/build-consent");

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).send({
    version: "1.0",
    name: "Livmore Backend Exam",
  });
});

app.get("/build-consent", buildXeroConsentUrl);
app.get("/process-contacts", processContacts);

app.listen(process.env.API_SERVICE_PORT || 3000, () => {
  console.log(`Example app listening on port ${port}`);
});
