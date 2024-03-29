const contributionService = require("../services/contribution.service");

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
      const facultyId = req.params.facultyId; 
      const contributions = await contributionService.viewAllContributionbyFaculty(facultyId);
      res.json(contributions);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
exports.getContributionDetails = async (req, res) => {
  try {
      const contributionId = req.params.id; 
      console.log(contributionId);
      const contribution = await contributionService.detailContribution(contributionId);
      res.status(200).json(contribution);
      }catch (error) {
        res.status(500).json({ error: error.message });
      }
};
