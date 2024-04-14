const contributionService = require("../services/contribution.service");
const { google } = require("googleapis");
const googleDriveService = require("../services/google-drive.service");
const cloudinaryService = require("../services/cloudinary.service");

exports.fetchFileThenReturnToBrowser = async (req, res) => {
  try {
    const authClient = await googleDriveService.authorizeGoogleDrive();
    const drive = google.drive({ version: "v3", auth: authClient });
    const fileName = req.query.document;

    const file = await drive.files.list({
      q: `name = '${fileName}'`,
    });

    if (file.data.files.length === 0) {
      res.status(404).json({ error: "File not found" });
    }

    const existedFile = file.data.files[0];
    // Return the file to the client
    drive.files.get(
      { fileId: existedFile.id, alt: "media" },
      { responseType: "stream" },
      function (err, response) {
        if (err) {
          console.log("The API returned an error: " + err);
          return;
        }
        res.setHeader("Content-Type", existedFile.mimeType);
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + existedFile.name
        );
        response.data.pipe(res);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
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
