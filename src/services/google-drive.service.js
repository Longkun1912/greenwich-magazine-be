const googleDriveConfig = require("../config/google.config");
const { Readable } = require("stream");
const { google } = require("googleapis");

const DOCUMENT_FOLDER_ID = "1ota1dquXIu0boWQV_dW_dkQuvvfPpNfr";
const IMAGE_FOLDER_ID = "1cgXL1TRX3cV4eHRjCOj_x9LWg9ii_Q_q";

const VALID_FILENAME_REGEX = /^[a-zA-Z0-9\s\-\_\.\/]+$/;

async function authorizeGoogleDrive() {
  const authClient = await googleDriveConfig();
  return authClient;
}

async function uploadFileToGoogleDrive(authClient, file, folderId) {
  if (!authClient) {
    throw new Error("Auth client is required");
  }
  if (!file) {
    throw new Error("File is required");
  }

  if (!VALID_FILENAME_REGEX.test(file.originalname)) {
    throw new Error(
      "File name can only contain letters, numbers, spaces, and these characters: - _ . /"
    );
  }

  const drive = google.drive({ version: "v3", auth: authClient });

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

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
}

async function uploadDocumentFileToGoogleDrive(authClient, file) {
  return uploadFileToGoogleDrive(authClient, file, DOCUMENT_FOLDER_ID);
}

async function uploadImageFileToGoogleDrive(authClient, file) {
  return uploadFileToGoogleDrive(authClient, file, IMAGE_FOLDER_ID);
}

async function deleteFileFromGoogleDrive(authClient, fileName, folderId) {
  if (!authClient) {
    throw new Error("Auth client is required");
  }

  const drive = google.drive({ version: "v3", auth: authClient });

  const query = `name = '${fileName}' and '${folderId}' in parents`;
  const response = await drive.files.list({ q: query });

  console.log("Deleting file from Google Drive: " + fileName);

  if (response.data.files.length === 0) {
    throw new Error("File not found");
  }

  const fileId = response.data.files[0].id;
  await drive.files.delete({ fileId });

  return "File name " + fileName + " deleted successfully";
}

async function deleteDocumentFileFromGoogleDrive(authClient, fileName) {
  return deleteFileFromGoogleDrive(authClient, fileName, DOCUMENT_FOLDER_ID);
}

async function deleteImageFileFromGoogleDrive(authClient, fileName) {
  return deleteFileFromGoogleDrive(authClient, fileName, IMAGE_FOLDER_ID);
}

async function checkIfFileExists(authClient, fileName, folderId) {
  if (!authClient) {
    throw new Error("Auth client is required");
  }

  const drive = google.drive({ version: "v3", auth: authClient });

  const query = `name = '${fileName}' and '${folderId}' in parents`;
  const response = await drive.files.list({ q: query });

  return response.data.files.length > 0;
}

async function checkIfDocumentFileExists(authClient, fileName) {
  return checkIfFileExists(authClient, fileName, DOCUMENT_FOLDER_ID);
}

async function checkIfImageFileExists(authClient, fileName) {
  return checkIfFileExists(authClient, fileName, IMAGE_FOLDER_ID);
}

async function fetchFileFromGoogleDrive(authClient, fileName, folderId) {
  if (!authClient) {
    throw new Error("Auth client is required");
  }

  const drive = google.drive({ version: "v3", auth: authClient });

  const query = `name = '${fileName}' and '${folderId}' in parents`;
  const response = await drive.files.list({ q: query });

  if (response.data.files.length === 0) {
    throw new Error("File not found");
  }

  const file = response.data.files[0];
  const fileId = file.id;

  const fileStream = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  return fileStream.data;
}

async function fetchDocumentFileFromGoogleDrive(authClient, fileName) {
  return fetchFileFromGoogleDrive(authClient, fileName, DOCUMENT_FOLDER_ID);
}

async function fetchImageFileFromGoogleDrive(authClient, fileName) {
  return fetchFileFromGoogleDrive(authClient, fileName, IMAGE_FOLDER_ID);
}

const googleDriveService = {
  authorizeGoogleDrive,
  uploadDocumentFileToGoogleDrive,
  uploadImageFileToGoogleDrive,
  deleteDocumentFileFromGoogleDrive,
  deleteImageFileFromGoogleDrive,
  checkIfDocumentFileExists,
  checkIfImageFileExists,
  fetchDocumentFileFromGoogleDrive,
  fetchImageFileFromGoogleDrive,
};

module.exports = googleDriveService;
