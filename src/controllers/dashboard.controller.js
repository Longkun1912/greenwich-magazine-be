const DashboardService = require("../services/dashboard.service");

exports.viewNumberOfContributionsDashboard = async (req, res) => {
  try {
    const result = await DashboardService.viewNumberOfContributionsDashboard();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.viewPercentageOfContributionsInFacultiesDashboard = async (
  req,
  res
) => {
  try {
    const result =
      await DashboardService.viewPercentageOfContributionsInFacultiesDashboard();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.viewNumberOfContributorsInEachFacultyDashboard = async (req, res) => {
  try {
    const result =
      await DashboardService.viewNumberOfContributorsForEachFacultyDashboard();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
