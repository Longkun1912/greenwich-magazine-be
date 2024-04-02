const Contribution = require("../models/contribution");
const Event = require("../models/event");
const Faculty = require("../models/faculty");

const DashboardService = {
  async viewNumberOfContributionsDashboard() {
    try {
      // Get all events
      const events = await Event.find();

      const data = events.map(async (event) => {
        // For each event, get all faculties
        const faculties = await Faculty.find();

        // For each faculty, count contributions
        const facultyContributions = await Promise.all(
          faculties.map(async (faculty) => {
            // Count contributions for each faculty
            const contributions = await Contribution.countDocuments({
              faculty: faculty._id,
              event: event._id,
            });

            // Now get both faculty name and contribution count
            return {
              faculty: faculty.name,
              contributions,
            };
          })
        );

        return {
          event: event.name,
          contributions: facultyContributions,
        };
      });

      return Promise.all(data);
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = DashboardService;
