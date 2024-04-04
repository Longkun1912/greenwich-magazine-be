const googleDriveConfig = require("../config/google.config");
const { Readable } = require("stream");
const { google } = require("googleapis");
const archiver = require("archiver");
const fs = require("fs");

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

async function downloadFileThenZip(authClient, fileName) {
  try {
    if (!authClient) {
      throw new Error("Auth client is required");
    }

    const drive = google.drive({ version: "v3", auth: authClient });
    const zipFileName = `greenwich-magazine.zip`;

    const file = await drive.files.list({
      q: `name = '${fileName}'`,
    });

    if (file.data.files.length === 0) {
      throw new Error("File not found");
    }

    // Download file
    const response = await drive.files.get(
      {
        fileId: file.data.files[0].id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    // Write the file to disk
    const filePath = `./${fileName}`;
    const dest = fs.createWriteStream(filePath);
    response.data.pipe(dest);

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      dest.on("finish", resolve);
      dest.on("error", reject);
    });

    // Create a zip file
    const zip = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const output = fs.createWriteStream(`./${zipFileName}`);
    zip.pipe(output);

    // Add the file to the zip
    zip.file(filePath, { name: fileName });

    // Finalize the zip (async)
    await zip.finalize();

    return zipFileName;
  } catch (error) {
    throw error;
  }
}

const googleDriveService = {
  authorizeGoogleDrive,
  downloadFileThenZip,
  uploadFileToGoogleDrive,
  deleteFileFromGoogleDrive,
};

module.exports = googleDriveService;
