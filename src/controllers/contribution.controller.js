const contributionService = require("../services/contribution.service");

exports.createContribution = async (req, res) => {
  try {
    const result = await contributionService.createContribution(
      req.body,
      req.files
    );
    res.status(201).json(result);
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
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const result = await contributionService.deleteContribution(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
