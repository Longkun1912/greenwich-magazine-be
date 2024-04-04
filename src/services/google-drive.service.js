const googleDriveConfig = require("../config/google.config");
const { Readable } = require("stream");
const { google } = require("googleapis");

const documentFolderId = "1eU7ljTB6Gk5AfO3536au_BmcSbU7HA5t";

// Authorize first
async function authorizeGoogleDrive() {
  const authClient = await googleDriveConfig();
  return authClient;
}

async function uploadFileToGoogleDrive(authClient, file) {
  try {
    if (!authClient) {
      throw new Error("Auth client is required");
    }
    if (!file) {
      throw new Error("File is required");
    }

    // File name can only English characters, else prevent upload
    const nonEnglishRegex = /[^\u0000-\u007F]+/;
    if (nonEnglishRegex.test(file.originalname)) {
      throw new Error("File name can only contain English characters");
    }

    // File name can only contain letters, numbers, spaces, and these characters: - _ . /
    const invalidFileNameRegex = /[^a-zA-Z0-9\s\-\_\.\/]+/;
    if (invalidFileNameRegex.test(file.originalname)) {
      throw new Error(
        "File name can only contain letters, numbers, spaces, and these characters: - _ . /"
      );
    }

    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetadata = {
      name: file.originalname,
      parents: [documentFolderId],
    };

    // Upload file
    const media = {
      mimeType: file.mimeType,
      body: Readable.from(file.buffer),
    };

    await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    return file.originalname;
  } catch (error) {
    throw error;
  }
}

async function deleteFileFromGoogleDrive(authClient, fileName) {
  try {
    if (!authClient) {
      throw new Error("Auth client is required");
    }
    const drive = google.drive({ version: "v3", auth: authClient });

    const file = await drive.files.list({
      q: `name = '${fileName}'`,
    });

    if (file.data.files.length === 0) {
      throw new Error("File not found");
    }

    return await drive.files.delete({
      fileId: file.data.files[0].id,
    });
  } catch (error) {
    throw error;
  }
}

const googleDriveService = {
  authorizeGoogleDrive,
  uploadFileToGoogleDrive,
  deleteFileFromGoogleDrive,
};

module.exports = googleDriveService;
