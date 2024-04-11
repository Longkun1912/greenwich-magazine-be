const Faculty = require("../models/faculty");
const Contribution = require("../models/contribution");
const User = require("../models/user");
const cloudinaryService = require("../services/cloudinary.service");

const facultyService = {
  async createFaculty(facultyForm, imageFile) {
    try {
      // Kiểm tra xem faculty đã tồn tại trong cơ sở dữ liệu chưa
      const existingFaculty = await Faculty.findOne({ name: facultyForm.name });
      if (existingFaculty) {
        throw new Error('Faculty with this name already exists.');
      }
      // Tạo faculty mới
      const faculty = new Faculty({
        name: facultyForm.name,
        description: facultyForm.description,
      });
      const formattedImageName = facultyForm.name
        .split(" ")
        .join("")
        .toLowerCase();
      // Nếu có ảnh được tải lên, thực hiện upload lên Cloudinary
      if (imageFile) {
        const imageName =
          await cloudinaryService.uploadFacultyImageToCloudinary(
            imageFile.buffer,
            formattedImageName
          );
        faculty.image = imageName;
      }
      // Lưu faculty vào cơ sở dữ liệu
      const createdFaculty = await faculty.save();
      return createdFaculty;
    } catch (error) {
      console.error("Error creating faculty:", error);
      throw error.response.data;
    }
  },

  // get all Faculty
  async getAllFaculties() {
    try {
      return await Faculty.find();
    } catch (error) {
      console.error("Error fetching faculties:", error);
      throw error;
    }
  },

  // update Faculty
  async updateFaculty(id, facultyForm, imageFile) {
    try {
      const faculty = await Faculty.findById(id);
      if (!faculty) {
        throw new Error("Faculty not found");
      }

      const oldName = faculty.name;

      // Cập nhật thông tin của faculty
      if (facultyForm.name) {
        faculty.name = facultyForm.name;
      }
      if (facultyForm.description) {
        faculty.description = facultyForm.description;
      }

      const formattedImageName = facultyForm.name
        .split(" ")
        .join("")
        .toLowerCase();

      // Kiểm tra và cập nhật ảnh nếu có
      if (imageFile) {
        await cloudinaryService.deleteFacultyImageFromCloudinary(oldName);

        const imageName =
          await cloudinaryService.uploadFacultyImageToCloudinary(
            imageFile.buffer,
            formattedImageName
          );
        faculty.image = imageName;
      }

      // Lưu faculty đã cập nhật vào cơ sở dữ liệu
      const updatedFaculty = await faculty.save();
      return updatedFaculty;
    } catch (error) {
      console.error("Error updating faculty:", error);
      throw error;
    }
  },

  // delete Faculty
  async deleteFaculty(id) {
    try {
      const faculty = await Faculty.findById(id);
      if (!faculty) {
        throw new Error("Faculty not found");
      }

      if (faculty.image) {
        await cloudinaryService.deleteFacultyImageFromCloudinary(faculty.name);
      }

      // Set contributions associated with the faculty to have faculty as null
      const contributions = await Contribution.find({ faculty: id });
      for (const contribution of contributions) {
        contribution.faculty = null;
        await contribution.save();
      }

      // Set users associated with the faculty to have faculty as null
      const users = await User.find({ faculty: id });
      for (const user of users) {
        user.faculty = null;
        await user.save();
      }

      await Faculty.findByIdAndDelete(id);
      return { message: "Successfully deleted faculty" };
    } catch (error) {
      console.error("Error deleting faculty:", error);
      throw error;
    }
  },

  async findFacultyByName(name) {
    try {
      return await Faculty.findOne({
        name: name,
      });
    } catch (error) {
      console.error("Error finding faculty by name:", error);
      throw error;
    }
  },
};

module.exports = facultyService;
