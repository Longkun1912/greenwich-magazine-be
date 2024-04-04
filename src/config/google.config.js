const { google } = require("googleapis");

const apiKeys = require("./google-api-key.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// Provide access to google drive api
async function authorizeGoogleDrive() {
  const jwtClient = new google.auth.JWT(
    apiKeys.client_email,
    null,
    apiKeys.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

module.exports = authorizeGoogleDrive;
