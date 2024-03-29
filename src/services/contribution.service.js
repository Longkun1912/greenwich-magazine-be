const Contribution = require("../models/contribution");
const cloudinaryService = require("../services/cloudinary.service");
const Event = require("../models/event");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");

const contributionService = {
  async createContribution(contributionForm, files) {
    try {
      const contribution = new Contribution({
        _id: uuidv4(),
        title: contributionForm.title,
        content: contributionForm.content,
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        event: contributionForm.event,
      });

      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      const fileTitle = contribution._id;

      if (imageFile) {
        const imageName =
          await cloudinaryService.uploadContributionImageToCloudinary(
            imageFile.buffer,
            fileTitle
          );
        contribution.image = imageName;
      }

      if (documentFile) {
        const documentName =
          await cloudinaryService.uploadContributionDocumentToCloudinary(
            documentFile.buffer,
            fileTitle
          );
        contribution.document = documentName;
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
      const contributionInfos = [];
      const contributions = await Contribution.find();
      for (let i = 0; i < contributions.length; i++) {
        const event = await Event.findById(contributions[i].event);
        const submitter = await User.findById(contributions[i].submitter);

        const contributionInfo = {
          id: contributions[i]._id,
          title: contributions[i].title,
          content: contributions[i].content,
          status: contributions[i].status,
          submitter: submitter.email,
          event: event.name,
          image: contributions[i].image,
          document: contributions[i].document,
        };
        contributionInfos.push(contributionInfo);
      }
      return contributionInfos;
    } catch (error) {
      console.error("Error fetching contributions:", error);
      throw error;
    }
  },

  async updateContribution(contributionForm, files) {
    try {
      const contribution = await Contribution.findById(contributionForm.id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }

      contribution.title = contributionForm.title;
      contribution.content = contributionForm.content;
      contribution.status = contributionForm.status || "pending";

      if (contributionForm.event) {
        const event = await Event.findById(contributionForm.event);
        if (!event) {
          throw new Error("Event not found");
        } else {
          contribution.event = contributionForm.event;
        }
      }

      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      const handleFile = async (file, fileType) => {
        if (file) {
          // Delete old file
          if (contribution[fileType]) {
            await cloudinaryService[
              `deleteContribution${
                fileType.charAt(0).toUpperCase() + fileType.slice(1)
              }FromCloudinary`
            ](contribution.id);
          }

          // Upload new file
          const fileName = await cloudinaryService[
            `uploadContribution${
              fileType.charAt(0).toUpperCase() + fileType.slice(1)
            }ToCloudinary`
          ](file.buffer, contribution.id);
          contribution[fileType] = fileName;
        }
      };

      await handleFile(imageFile, "image");
      await handleFile(documentFile, "document");

      const updatedContribution = await contribution.save();
      return updatedContribution;
    } catch (error) {
      console.error("Error updating contribution:", error);
      throw error;
    }
  },

  async deleteContribution(id) {
    try {
      const contribution = await Contribution.findById(id);

      console.log("Deleting contribution image:", contribution.title);
      if (contribution.image) {
        await cloudinaryService.deleteContributionImageFromCloudinary(
          contribution.title
        );
      }

      console.log("Deleting contribution document:", contribution.title);
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
