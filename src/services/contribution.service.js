const Contribution = require("../models/contribution");
const cloudinaryService = require("../services/cloudinary.service");

const contributionService = {
  async createContribution(contributionForm, imageFile) {
    try {
      let imageName = null;

      if (imageFile) {
        imageName = await cloudinaryService.uploadContributionImageToCloudinary(
          imageFile.buffer,
          contributionForm.title
        );
      }

      const contribution = new Contribution({
        title: contributionForm.title,
        content: contributionForm.content,
        document: contributionForm.document,
        image: imageName, 
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        event: contributionForm.event,
      });

      const createdContribution = await contribution.save();
      return createdContribution;
    } catch (error) {
      console.error("Error creating contribution:", error);
      throw error;
    }
  },

  async getAllContributions() {
    try {
      return await Contribution.find();
    } catch (error) {
      console.error("Error fetching contributions:", error);
      throw error;
    }
  },

  async updateContribution(id, contributionForm) {
    try {
      const contribution = await Contribution.findById(id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }

      if (contributionForm.title) {
        contribution.title = contributionForm.title;
      }
      if (contributionForm.content) {
        contribution.content = contributionForm.content;
      }
      if (contributionForm.document) {
        contribution.document = contributionForm.document;
      }
      if (contributionForm.status) {
        contribution.status = contributionForm.status;
      }
      if (contributionForm.submitter) {
        contribution.submitter = contributionForm.submitter;
      }
      if (contributionForm.event) {
        contribution.event = contributionForm.event;
      }
      if (contributionForm.imageFile) {
        const imageName = await cloudinaryService.uploadContributionImageToCloudinary(
          contributionForm.imageFile.buffer,
          contributionForm.title
        );
        contribution.image = imageName;
      }

      const updatedContribution = await contribution.save();
      return updatedContribution;
    } catch (error) {
      console.error("Error updating contribution:", error);
      throw error;
    }
  },

  async deleteContribution(id) {
    try {
      const deletedContribution = await Contribution.findByIdAndDelete(id);
      if (!deletedContribution) {
        throw new Error("Contribution not found");
      }
      return { message: "Successfully deleted contribution" };
    } catch (error) {
      console.error("Error deleting contribution:", error);
      throw error;
    }
  },
};

module.exports = contributionService;
