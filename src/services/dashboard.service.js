const Contribution = require("../models/contribution");
const Event = require("../models/event");
const Faculty = require("../models/faculty");
const User = require("../models/user");

const DashboardService = {
  // First dashboard
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

  // Second dashboard
  async viewPercentageOfContributionsInFacultiesDashboard() {
    try {
      const faculties = await Faculty.find();

      // Get contributions for each faculty
      const data = await Promise.all(
        faculties.map(async (faculty) => {
          const contributions = await Contribution.countDocuments({
            faculty: faculty._id,
          });

          return {
            faculty: faculty.name,
            contributions,
          };
        })
      );

      // Then calculate percentage of contributions for each faculty with the total contributions
      const totalContributions = data.reduce(
        (acc, faculty) => acc + faculty.contributions,
        0
      );

      return data.map((faculty) => ({
        faculty: faculty.faculty,
        percentage: parseFloat(
          ((faculty.contributions / totalContributions) * 100).toFixed(2)
        ),
      }));
    } catch (error) {
      throw new Error(error);
    }
  },

  // Third dashboard
  async viewNumberOfContributorsForEachFacultyDashboard() {
    try {
      const faculties = await Faculty.find();

      const data = await Promise.all(
        faculties.map(async (faculty) => {
          const contributors = await User.countDocuments({
            faculty: faculty._id,
          });

          return {
            faculty: faculty.name,
            contributors,
          };
        })
      );

      return data;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = DashboardService;
