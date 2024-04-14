const contributionService = require("../services/contribution.service");
const { google } = require("googleapis");
const googleDriveService = require("../services/google-drive.service");
const JSZip = require("jszip");

exports.fetchFilesThenReturnToBrowser = async (req, res) => {
  try {
    const authClient = await googleDriveService.authorizeGoogleDrive();

    const documents = req.query.documents ? req.query.documents : [];
    const images = req.query.images ? req.query.images : [];

    const allFiles = [];
    const zip = new JSZip();

    // Fetch documents concurrently
    for (const document of documents) {
      try {
        const fileStream =
          await googleDriveService.fetchDocumentFileFromGoogleDrive(
            authClient,
            document
          );
        zip.file(document, fileStream, { stream: true });
      } catch (error) {
        console.error(`Error fetching document ${document}:`, error);
      }
    }

    // Fetch images concurrently
    for (const image of images) {
      try {
        const fileStream =
          await googleDriveService.fetchImageFileFromGoogleDrive(
            authClient,
            image
          );
        zip.file(image, fileStream, { stream: true });
      } catch (error) {
        console.error(`Error fetching image ${image}:`, error);
      }
    }

    if (allFiles.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-disposition", "attachment; filename=files.zip");
    zip.generateNodeStream({ type: "stream" }).pipe(res); // Stream zip to response
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createContribution = async (req, res) => {
  try {
    await contributionService.createContribution(req.body, req.files);
    res.status(200).json("Create contribution successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await contributionService.getAllContributions();
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    const result = await contributionService.updateContribution(
      req.body,
      req.files
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const result = await contributionService.deleteContribution(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.viewAllContributionbyFaculty = async (req, res) => {
  try {
    const userId = req.params.id;
    const contributions =
      await contributionService.viewAllContributionbyFaculty(userId);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContributionDetails = async (req, res) => {
  try {
    const contributionId = req.params.id;
    console.log(contributionId);
    const contribution = await contributionService.detailContribution(
      contributionId
    );
    res.status(200).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContributionForStudent = async (req, res) => {
  try {
    await contributionService.createContributionForStudent(req.body, req.files);
    res.status(200).json("Create contribution successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContributionForStudent = async (req, res) => {
  try {
    const result = await contributionService.updateContributionForStudent(
      req.body,
      req.files
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContributionForStudent = async (req, res) => {
  try {
    const result = await contributionService.deleteContributionForStudent(
      req.params.id
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//coordinator
exports.changeContributionState = async (req, res) => {
  try {
    const updatedContribution =
      await contributionService.changeContributionState(req.body.id, req.body);
    res.status(200).json(updatedContribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//viewAllContributionbyIdFaculty
exports.viewAllContributionbyIdFaculty = async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    const contributions =
      await contributionService.viewAllContributionbyIdFaculty(facultyId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Guest
exports.getPublicContributions = async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    const publicContributions =
      await contributionService.getPublicContributionsForGuest(facultyId);
    res.json(publicContributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
