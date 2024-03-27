const Contribution = require("../models/contribution");
const cloudinaryService = require("../services/cloudinary.service");

const contributionService = {
  async createContribution(contributionForm, files) {
    try {
      const contribution = new Contribution({
        title: contributionForm.title,
        content: contributionForm.content,
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        event: contributionForm.event,
      });

      const imageFile = files["imageFile"] ? files["imageFile"][0] : null;
      const documentFile = files["documentFile"]
        ? files["documentFile"][0]
        : null;

      if (imageFile) {
        const imageName =
          await cloudinaryService.uploadContributionImageToCloudinary(
            imageFile.buffer,
            contributionForm.title
          );
        contribution.image = imageName;
      } else {
        contribution.image = null;
      }

      if (documentFile) {
        const documentName =
          await cloudinaryService.uploadContributionDocumentToCloudinary(
            documentFile.buffer,
            contributionForm.title
          );
        contribution.document = documentName;
      } else {
        contribution.document = null;
      }

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

  async updateContribution(contributionForm, imageFile, documentFile) {
    try {
      const contribution = await Contribution.findById(contributionForm.id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }

      contribution.title = contributionForm.title;
      contribution.content = contributionForm.content;
      contribution.status = contributionForm.status || "pending";
      contribution.submitter = contributionForm.submitter;
      contribution.event = contributionForm.event;

      if (contributionForm.imageFile) {
        await cloudinaryService.deleteContributionImageFromCloudinary(
          contribution.title
        );
        const imageName =
          await cloudinaryService.uploadContributionImageToCloudinary(
            imageFile.buffer,
            contributionForm.title
          );
        contribution.image = imageName;
      }

      if (contributionForm.documentFile) {
        await cloudinaryService.deleteContributionDocumentFromCloudinary(
          contribution.title
        );
        const documentName =
          await cloudinaryService.uploadContributionDocumentToCloudinary(
            documentFile.buffer,
            contributionForm.title
          );
        contribution.document = documentName;
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
      const contribution = Contribution.findById(id);

      if (contribution.image) {
        await cloudinaryService.deleteContributionImageFromCloudinary(
          contribution.title
        );
      }

      if (contribution.document) {
        await cloudinaryService.deleteContributionDocumentFromCloudinary(
          contribution.title
        );
      }

      await Contribution.findByIdAndDelete(id);

      return { message: "Successfully deleted contribution" };
    } catch (error) {
      console.error("Error deleting contribution:", error);
      throw error;
    }
  },
};

module.exports = contributionService;
