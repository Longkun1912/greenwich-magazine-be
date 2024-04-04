const Contribution = require("../models/contribution");
const cloudinaryService = require("../services/cloudinary.service");
const googleDriveService = require("../services/google-drive.service");
const Event = require("../models/event");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const { v4: uuidv4 } = require("uuid");

const handleFile = async (file, fileType, contribution) => {
  if (file) {
    // Delete old file
    if (contribution[fileType]) {
      await cloudinaryService[
        `deleteContribution${
          fileType.charAt(0).toUpperCase() + fileType.slice(1)
        }FromCloudinary`
      ](contribution.title);
    }

    // Upload new file
    const fileName = await cloudinaryService[
      `uploadContribution${
        fileType.charAt(0).toUpperCase() + fileType.slice(1)
      }ToCloudinary`
    ](file.buffer, contribution.title);
    contribution[fileType] = fileName;
  }
};

const contributionService = {
  async createContribution(contributionForm, files) {
    try {
      // Check if title is duplicated
      const existingContribution = await Contribution.findOne({
        title: contributionForm.title,
      });
      if (existingContribution) {
        throw new Error("Contribution title already exists");
      }

      const contribution = new Contribution({
        _id: uuidv4(),
        title: contributionForm.title,
        content: contributionForm.content,
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        event: contributionForm.event,
        faculty: contributionForm.faculty,
      });

      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      const fileTitle = contribution.title;

      if (documentFile) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        const documentName = await googleDriveService.uploadFileToGoogleDrive(
          authClient,
          documentFile
        );
        console.log("Document name:", documentName);
        contribution.document = documentName;
      }

      if (imageFile) {
        const imageName =
          await cloudinaryService.uploadContributionImageToCloudinary(
            imageFile.buffer,
            fileTitle
          );
        contribution.image = imageName;
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
        const faculty = await Faculty.findById(contributions[i].faculty);
        const submitter = await User.findById(contributions[i].submitter);

        const contributionInfo = {
          id: contributions[i]._id,
          title: contributions[i].title,
          content: contributions[i].content,
          status: contributions[i].status,
          submitter: submitter.email,
          image: contributions[i].image,
          document: contributions[i].document,
        };

        if (event) {
          contributionInfo.event = event.name;
        }
        if (faculty) {
          contributionInfo.faculty = faculty.name;
        }
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

      // Check if title is duplicated
      const existingContribution = await Contribution.findOne({
        title: contributionForm.title,
      });
      if (existingContribution && existingContribution.id !== contribution.id) {
        throw new Error("Contribution title already exists");
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

      if (contributionForm.faculty) {
        const faculty = await Faculty.findById(contributionForm.faculty);
        if (!faculty) {
          throw new Error("Faculty not found");
        } else {
          contribution.faculty = contributionForm.faculty;
        }
      }

      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      if (documentFile) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          documentFile
        );
        const documentName = await googleDriveService.uploadFileToGoogleDrive(
          authClient,
          documentFile
        );
        console.log("Document name:", documentName);
        contribution.document = documentName;
      }

      if (imageFile) {
        await handleFile(imageFile, "image", contribution);
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
      const contribution = await Contribution.findById(id);

      if (contribution.document) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          documentFile
        );
      }

      if (contribution.image) {
        await cloudinaryService.deleteContributionImageFromCloudinary(
          contribution.id
        );
      }

      await Contribution.findByIdAndDelete(id);

      return { message: "Successfully deleted contribution" };
    } catch (error) {
      console.error("Error deleting contribution:", error);
      throw error;
    }
  },

  async viewAllContributionbyFaculty(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const contributionInfos = [];

      const contributions = await Contribution.find({ faculty: user.faculty });

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
      console.error("Error fetching contributions by faculty:", error);
      throw error;
    }
  },

  async detailContribution(id) {
    try {
      const contribution = await Contribution.findById(id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }
      return contribution;
    } catch (error) {
      console.error("Error fetching contribution details:", error);
      throw error;
    }
  },
  async getPublicContributionsForGuest() {
    try {
      const publicContributions = await Contribution.find({ state: "public" })
        .populate("submitter", "username")
        .populate("event", "name")
        .populate("faculty", "name");
      return publicContributions;
    } catch (error) {
      console.error("Error fetching public contributions:", error);
      throw error;
    }
  },

  async createContributionForStudent(contributionForm, files) {
    try {
      // Check if title is duplicated
      const existingContribution = await Contribution.findOne({
        title: contributionForm.title,
      });
      if (existingContribution) {
        throw new Error("Contribution title already exists");
      }

      const submitter = await User.findById(contributionForm.submitter);
      if (!submitter) {
        throw new Error("Submitter not found");
      }

      const faculty = await Faculty.findById(submitter.faculty);
      if (!faculty) {
        throw new Error("Faculty not found");
      }

      const event = await Event.findById(contributionForm.event);
      if (!event) {
        throw new Error("Event not found");
      } else {
        const currentDate = new Date();
        if (currentDate > new Date(event.firstDeadLineDate)) {
          throw new Error(
            "Contribution cannot be submitted after the first deadline"
          );
        }
      }

      const currentDate = new Date();
      if (currentDate > new Date(event.firstDeadLineDate)) {
        throw new Error(
          "Contribution cannot be created after the first deadline"
        );
      }

      const contribution = new Contribution({
        _id: uuidv4(),
        title: contributionForm.title,
        content: contributionForm.content,
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        faculty: faculty._id,
        event: event._id,
      });

      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      const fileTitle = contribution.title;

      if (documentFile) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        const documentName = await googleDriveService.uploadFileToGoogleDrive(
          authClient,
          documentFile
        );
        console.log("Document name:", documentName);
        contribution.document = documentName;
      }

      if (imageFile) {
        const imageName =
          await cloudinaryService.uploadContributionImageToCloudinary(
            imageFile.buffer,
            fileTitle
          );
        contribution.image = imageName;
      }

      const createdContribution = await contribution.save();
      return createdContribution;
    } catch (error) {
      console.error("Error creating contribution:", error);
      throw error;
    }
  },

  async updateContributionForStudent(contributionForm, files) {
    try {
      const contribution = await Contribution.findById(contributionForm.id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }

      // Check if title is duplicated
      const existingContribution = await Contribution.findOne({
        title: contributionForm.title,
      });
      if (existingContribution && existingContribution.id !== contribution.id) {
        throw new Error("Contribution title already exists");
      }

      let event;

      if (!contributionForm.event) {
        event = await Event.findById(contribution.event);
      } else {
        event = await Event.findById(contributionForm.event);
      }

      const currentDate = new Date();
      if (event) {
        if (currentDate > new Date(event.finalDeadLineDate)) {
          throw new Error(
            "Contribution cannot be updated after the final deadline"
          );
        } else {
          contribution.event = contributionForm.event;
        }
      }

      // Cập nhật thông tin của contribution
      contribution.title = contributionForm.title;
      contribution.content = contributionForm.content;

      // Xử lý tệp ảnh và tệp tài liệu
      const imageFile = files["image"] ? files["image"][0] : null;
      const documentFile = files["document"] ? files["document"][0] : null;

      if (documentFile) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          contribution.document
        );

        const documentName = await googleDriveService.uploadFileToGoogleDrive(
          authClient,
          documentFile
        );
        console.log("Document name:", documentName);
        contribution.document = documentName;
      }

      if (imageFile) {
        await handleFile(imageFile, "image", contribution);
      }

      return await contribution.save();
    } catch (error) {
      console.error("Error updating contribution:", error);
      throw error;
    }
  },

  async deleteContributionForStudent(id) {
    try {
      const contribution = await Contribution.findById(id);
      if (!contribution) {
        throw new Error("Contribution not found");
      }

      const event = await Event.findById(contribution.event);
      if (!event) {
        throw new Error("Event not found");
      }

      const currentDate = new Date();
      if (currentDate > new Date(event.finalDeadLineDate)) {
        throw new Error(
          "Contribution cannot be deleted after the final deadline"
        );
      }

      console.log("Deleting contribution document:", contribution.title);
      if (contribution.document) {
        const authClient = await googleDriveService.authorizeGoogleDrive();
        await googleDriveService.deleteFileFromGoogleDrive(
          authClient,
          contribution.document
        );
      }

      console.log("Deleting contribution image:", contribution.title);
      if (contribution.image) {
        await cloudinaryService.deleteContributionImageFromCloudinary(
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

  async changeContributionState(contributionId, editForm) {
    try {
      const contribution = await Contribution.findById(contributionId);
      if (!contribution) {
        throw new Error("Contribution not found");
      }
      contribution.status = editForm.status;
      contribution.state = editForm.state;
      const updatedContribution = await contribution.save();
      return updatedContribution;
    } catch (error) {
      console.error("Error changing contribution status:", error);
      throw error;
    }
  },

  //viewAllContributionbyIdFaculty
  async viewAllContributionbyIdFaculty(facultyId) {
    try {
      const contributionInfos = [];
      const contributions = await Contribution.find({ faculty: facultyId });
      for (let i = 0; i < contributions.length; i++) {
        const event = await Event.findById(contributions[i].event);
        const faculty = await Faculty.findById(contributions[i].faculty);
        const submitter = await User.findById(contributions[i].submitter);

        const contributionInfo = {
          id: contributions[i]._id,
          title: contributions[i].title,
          content: contributions[i].content,
          status: contributions[i].status,
          submitter: submitter.email,
          event: event.name,
          faculty: faculty.name,
          image: contributions[i].image,
          document: contributions[i].document,
          state: contributions[i].state,
        };
        contributionInfos.push(contributionInfo);
      }
      return contributionInfos;
    } catch (error) {
      console.error("Error fetching contributions by faculty:", error);
      throw error;
    }
  },
};

module.exports = contributionService;
