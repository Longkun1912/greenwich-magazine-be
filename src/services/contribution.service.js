const Contribution = require("../models/contribution");
const googleDriveService = require("../services/google-drive.service");
const Event = require("../models/event");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const Role = require("../models/role");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");

const getFilename = (url) => {
  return decodeURIComponent(url.split("/").pop());
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
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        event: contributionForm.event,
        faculty: contributionForm.faculty,
      });

      // Handle checking document files
      const authClient = await googleDriveService.authorizeGoogleDrive();
      if (files["document"]) {
        // Check if the document file already exists in Google Drive
        for (const documentFile of files["document"]) {
          const documentName = documentFile.originalname;
          const documentExists =
            await googleDriveService.checkIfDocumentFileExists(
              authClient,
              documentName
            );
          if (documentExists === true) {
            throw new Error(
              "Document file name " + documentName + " already exists"
            );
          }
        }
      } else {
        throw new Error("You must upload at least one document");
      }

      // Handle checking image files
      if (files["image"]) {
        // Check if the image file already exists in Cloudinary
        for (const imageFile of files["image"]) {
          const imageName = imageFile.originalname;
          const imageExists = await googleDriveService.checkIfImageFileExists(
            authClient,
            imageName
          );
          if (imageExists === true) {
            throw new Error("Image file name " + imageName + " already exists");
          }
        }
      } else {
        throw new Error("You must upload at least one image");
      }

      // Handle uploading document files
      for (const documentFile of files["document"]) {
        const documentName =
          await googleDriveService.uploadDocumentFileToGoogleDrive(
            authClient,
            documentFile
          );
        contribution.documents.push(documentName);
      }

      // Handle uploading image files
      for (const imageFile of files["image"]) {
        const imageName = await googleDriveService.uploadImageFileToGoogleDrive(
          authClient,
          imageFile
        );
        contribution.images.push(imageName);
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
          status: contributions[i].status,
          submitter: submitter.email,
          images: contributions[i].images,
          documents: contributions[i].documents,
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

      const authClient = await googleDriveService.authorizeGoogleDrive();

      // Check in drive for duplicated document files but exclude the old document files
      if (files["document"]) {
        for (const documentFile of files["document"]) {
          const documentName = documentFile.originalname;
          const documentExists =
            await googleDriveService.checkIfDocumentFileExists(
              authClient,
              documentName
            );
          if (documentExists === true) {
            if (
              !contribution.documents
                .map((name) => name.toLowerCase())
                .includes(documentName.toLowerCase())
            ) {
              throw new Error(
                "Document file name " + documentName + " already exists"
              );
            }
          }
        }
      }

      // Check in drive for duplicated image files but exclude the old image files
      if (files["image"]) {
        for (const imageFile of files["image"]) {
          const imageName = imageFile.originalname;
          const imageExists = await googleDriveService.checkIfImageFileExists(
            authClient,
            imageName
          );
          if (imageExists === true) {
            if (
              !contribution.images
                .map((name) => name.toLowerCase())
                .includes(imageName.toLowerCase())
            ) {
              throw new Error(
                "Image file name " + imageName + " already exists"
              );
            }
          }
        }
      }

      // Handle document files
      if (files["document"]) {
        // Compare the new document files with the old ones, check if there are any files that need to be deleted
        const oldDocumentFileNames = contribution.documents;

        const newDocumentFileNames = files["document"].map(
          (file) => file.originalname
        );

        // Console.log the old and new document file names
        console.log("Old document file names:", oldDocumentFileNames);
        console.log("New document file names:", newDocumentFileNames);

        for (const oldDocumentFileName of oldDocumentFileNames) {
          // If the old document file is not included in the new document files, delete it
          if (!newDocumentFileNames.includes(oldDocumentFileName)) {
            console.log(
              "Deleting document file that does not included:",
              oldDocumentFileName
            );
            await googleDriveService.deleteDocumentFileFromGoogleDrive(
              authClient,
              oldDocumentFileName
            );
            contribution.documents = contribution.documents.filter(
              (document) => document !== oldDocumentFileName
            );
          }
        }

        // If the new document file is not included in the old document files, upload it
        // But if the new document file is included in the old document files, do nothing
        for (const documentFile of files["document"]) {
          if (
            !oldDocumentFileNames
              .map((name) => name.toLowerCase())
              .includes(documentFile.originalname.toLowerCase())
          ) {
            console.log(
              "Uploading new document file:",
              documentFile.originalname
            );
            const documentName =
              await googleDriveService.uploadDocumentFileToGoogleDrive(
                authClient,
                documentFile
              );
            contribution.documents.push(documentName);
          }
        }
      }

      // Handle image files
      if (files["image"]) {
        // Compare the new image files with the old ones, check if there are any files that need to be deleted
        const oldImageFiles = contribution.images;

        const newImageFiles = files["image"].map((file) => file.originalname);

        // Console.log the old and new image file names
        console.log("Old image file names:", oldImageFiles);
        console.log("New image file names:", newImageFiles);

        for (const oldImageFile of oldImageFiles) {
          // If the old image file is not included in the new image files, delete it
          if (!newImageFiles.includes(oldImageFile)) {
            console.log(
              "Deleting image file that does not included:",
              oldImageFile
            );
            await googleDriveService.deleteImageFileFromGoogleDrive(
              authClient,
              oldImageFile
            );
            // Filter out the deleted image file
            contribution.images = contribution.images.filter(
              (image) => image !== oldImageFile
            );
          }
        }

        // If the new image file is not included in the old image files, upload it
        // But if the new image file is included in the old image files, do nothing
        for (const imageFile of files["image"]) {
          if (
            !oldImageFiles
              .map((name) => name.toLowerCase())
              .includes(imageFile.originalname.toLowerCase())
          ) {
            console.log("Uploading new image file:", imageFile.originalname);
            const imageName =
              await googleDriveService.uploadImageFileToGoogleDrive(
                authClient,
                imageFile
              );
            contribution.images.push(imageName);
          }
        }
      }

      return await contribution.save();
    } catch (error) {
      console.error("Error updating contribution:", error);
      throw error;
    }
  },

  async deleteContribution(id) {
    try {
      const contribution = await Contribution.findById(id);
      await contribution.deleteOne({ _id: id });

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
          status: contributions[i].status,
          submitter: submitter.email,
          event: event.name,
          images: contributions[i].images,
          documents: contributions[i].documents,
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
        throw new Error("This student is not associated with any faculty.");
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
        status: contributionForm.status || "pending",
        submitter: contributionForm.submitter,
        faculty: faculty._id,
        event: event._id,
        state: contributionForm.state || "private",
      });

      // Handle checking document files
      const authClient = await googleDriveService.authorizeGoogleDrive();
      if (files["document"]) {
        // Check if the document file already exists in Google Drive
        for (const documentFile of files["document"]) {
          const documentName = documentFile.originalname;
          const documentExists =
            await googleDriveService.checkIfDocumentFileExists(
              authClient,
              documentName
            );
          if (documentExists === true) {
            throw new Error(
              "Document file name " + documentName + " already exists"
            );
          }
        }
      } else {
        throw new Error("You must upload at least one document");
      }

      // Handle checking image files
      if (files["image"]) {
        // Check if the image file already exists in Cloudinary
        for (const imageFile of files["image"]) {
          const imageName = imageFile.originalname;
          const imageExists = await googleDriveService.checkIfImageFileExists(
            authClient,
            imageName
          );
          if (imageExists === true) {
            throw new Error("Image file name " + imageName + " already exists");
          }
        }
      } else {
        throw new Error("You must upload at least one image");
      }

      // Handle uploading document files
      for (const documentFile of files["document"]) {
        const documentName =
          await googleDriveService.uploadDocumentFileToGoogleDrive(
            authClient,
            documentFile
          );
        contribution.documents.push(documentName);
      }

      // Handle uploading image files
      for (const imageFile of files["image"]) {
        const imageName = await googleDriveService.uploadImageFileToGoogleDrive(
          authClient,
          imageFile
        );
        contribution.images.push(imageName);
      }

      const createdContribution = await contribution.save();
      const coordinatorRole = await Role.findOne({ name: "coordinator" });
      if (!coordinatorRole) {
        throw new Error('Role "coordinator" not found');
      }

      const coordinatorRoleId = coordinatorRole._id;

      const coordinator = await User.findOne({
        role: coordinatorRoleId,
        faculty: contribution.faculty,
      });
      if (!coordinator) {
        throw new Error("Coordinator not found");
      }

      const emailStudent = submitter.email;
      const emailTemplatePath = path.resolve(
        __dirname,
        "../utils/emailTemplate.html"
      );
      const template = fs.readFileSync(emailTemplatePath, "utf8");
      const customTemplate = template.replace("email", emailStudent);
      const customTemplate2 = customTemplate.replace(
        "username",
        coordinator.username
      );
      const customTemplate3 = customTemplate2.replace(
        /\[contributionLink\]/g,
        process.env.FE_URL
      );
      await sendEmail({
        from: `${process.env.MAIL_USER}`,
        to: coordinator.email,
        subject: "New contribution has been created !!!",
        html: customTemplate3,
      });
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

      const submitter = await User.findById(contribution.submitter);
      const faculty = await Faculty.findById(submitter.faculty);

      if (!faculty) {
        throw new Error("This student is not associated with any faculty.");
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
      contribution.title = contributionForm.title;

      const authClient = await googleDriveService.authorizeGoogleDrive();

      // Check in drive for duplicated document files but exclude the old document files
      if (files["document"]) {
        for (const documentFile of files["document"]) {
          const documentName = documentFile.originalname;
          const documentExists =
            await googleDriveService.checkIfDocumentFileExists(
              authClient,
              documentName
            );
          if (documentExists === true) {
            if (
              !contribution.documents
                .map((name) => name.toLowerCase())
                .includes(documentName.toLowerCase())
            ) {
              throw new Error(
                "Document file name " + documentName + " already exists"
              );
            }
          }
        }
      }

      // Check in drive for duplicated image files but exclude the old image files
      if (files["image"]) {
        for (const imageFile of files["image"]) {
          const imageName = imageFile.originalname;
          const imageExists = await googleDriveService.checkIfImageFileExists(
            authClient,
            imageName
          );
          if (imageExists === true) {
            if (
              !contribution.images
                .map((name) => name.toLowerCase())
                .includes(imageName.toLowerCase())
            ) {
              throw new Error(
                "Image file name " + imageName + " already exists"
              );
            }
          }
        }
      }

      // Handle document files
      if (files["document"]) {
        // Compare the new document files with the old ones, check if there are any files that need to be deleted
        const oldDocumentFileNames = contribution.documents;

        const newDocumentFileNames = files["document"].map(
          (file) => file.originalname
        );

        // Console.log the old and new document file names
        console.log("Old document file names:", oldDocumentFileNames);
        console.log("New document file names:", newDocumentFileNames);

        for (const oldDocumentFileName of oldDocumentFileNames) {
          // If the old document file is not included in the new document files, delete it
          if (!newDocumentFileNames.includes(oldDocumentFileName)) {
            console.log(
              "Deleting document file that does not included:",
              oldDocumentFileName
            );
            await googleDriveService.deleteDocumentFileFromGoogleDrive(
              authClient,
              oldDocumentFileName
            );
            contribution.documents = contribution.documents.filter(
              (document) => document !== oldDocumentFileName
            );
          }
        }

        // If the new document file is not included in the old document files, upload it
        // But if the new document file is included in the old document files, do nothing
        for (const documentFile of files["document"]) {
          if (
            !oldDocumentFileNames
              .map((name) => name.toLowerCase())
              .includes(documentFile.originalname.toLowerCase())
          ) {
            console.log(
              "Uploading new document file:",
              documentFile.originalname
            );
            const documentName =
              await googleDriveService.uploadDocumentFileToGoogleDrive(
                authClient,
                documentFile
              );
            contribution.documents.push(documentName);
          }
        }
      }

      // Handle image files
      if (files["image"]) {
        // Compare the new image files with the old ones, check if there are any files that need to be deleted
        const oldImageFiles = contribution.images;

        const newImageFiles = files["image"].map((file) => file.originalname);

        // Console.log the old and new image file names
        console.log("Old image file names:", oldImageFiles);
        console.log("New image file names:", newImageFiles);

        for (const oldImageFile of oldImageFiles) {
          // If the old image file is not included in the new image files, delete it
          if (!newImageFiles.includes(oldImageFile)) {
            console.log(
              "Deleting image file that does not included:",
              oldImageFile
            );
            await googleDriveService.deleteImageFileFromGoogleDrive(
              authClient,
              oldImageFile
            );
            // Filter out the deleted image file
            contribution.images = contribution.images.filter(
              (image) => image !== oldImageFile
            );
          }
        }

        // If the new image file is not included in the old image files, upload it
        // But if the new image file is included in the old image files, do nothing
        for (const imageFile of files["image"]) {
          if (
            !oldImageFiles
              .map((name) => name.toLowerCase())
              .includes(imageFile.originalname.toLowerCase())
          ) {
            console.log("Uploading new image file:", imageFile.originalname);
            const imageName =
              await googleDriveService.uploadImageFileToGoogleDrive(
                authClient,
                imageFile
              );
            contribution.images.push(imageName);
          }
        }
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

      await contribution.deleteOne({ _id: id });

      return { message: "Successfully deleted contribution" };
    } catch (error) {
      console.error("Error deleting contribution:", error);
      throw error;
    }
  },

  //coordinator
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
  async viewAllContributionbyIdFaculty(coordinatorId) {
    try {
      const coordinator = await User.findById(coordinatorId);
      if (!coordinator) {
        throw new Error("Coordinator not found");
      }

      const facultyId = coordinator.faculty; // Giả sử coordinator có trường faculty lưu ID của faculty mà họ quản lý
      if (!facultyId) {
        throw new Error("Coordinator is not associated with any faculty");
      }

      const contributionInfos = [];
      const contributions = await Contribution.find({ faculty: facultyId });

      for (let i = 0; i < contributions.length; i++) {
        const event = await Event.findById(contributions[i].event);
        const faculty = await Faculty.findById(contributions[i].faculty);
        const submitter = await User.findById(contributions[i].submitter);

        const contributionInfo = {
          id: contributions[i]._id,
          title: contributions[i].title,
          status: contributions[i].status,
          submitter: submitter.email,
          event: event.name,
          faculty: faculty.name,
          images: contributions[i].images,
          documents: contributions[i].documents,
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

  //Guest
  async getPublicContributionsForGuest(guestId) {
    try {
      const guest = await User.findById(guestId);
      if (!guest) {
        throw new Error("guest not found");
      }

      const facultyId = guest.faculty; // Giả sử guest có trường faculty lưu ID của faculty mà họ quản lý
      if (!facultyId) {
        throw new Error("guest is not associated with any faculty");
      }

      // Lấy ra tất cả các đóng góp công khai từ khoa tương ứng
      const publicContributions = await Contribution.find({
        faculty: facultyId,
        state: "public",
      })
        .populate("submitter", "username")
        .populate("event", "name")
        .populate("faculty", "name");

      return publicContributions;
    } catch (error) {
      console.error("Error fetching public contributions:", error);
      throw error;
    }
  },
};

module.exports = contributionService;
