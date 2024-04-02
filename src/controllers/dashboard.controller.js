const DashboardService = require("../services/dashboard.service");

exports.viewNumberOfContributionsDashboard = async (req, res) => {
  try {
    const result = await DashboardService.viewNumberOfContributionsDashboard();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
