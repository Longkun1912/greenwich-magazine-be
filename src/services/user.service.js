var bcrypt = require("bcryptjs");
const RoleService = require("../services/role.service");
const FacultyService = require("../services/faculty.service");
const User = require("../models/user");
const cloudinaryService = require("../services/cloudinary.service");

const UserService = {
  async createUser(userForm, avatar_image) {
    try {
      const user = new User({
        username: userForm.username,
        email: userForm.email,
        mobile: userForm.mobile,
        password: bcrypt.hashSync(userForm.password),
      });

      if (avatar_image) {
        const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
          avatar_image.buffer,
          userForm.email
        );
        user.avatar = avatarName;
      }

      const [role, faculty] = await Promise.all([
        RoleService.findRoleByName(userForm.role),
        FacultyService.findFacultyByName(userForm.faculty),
      ]);

      user.role = role;
      user.faculty = faculty;

      console.log("New User: " + user);
      return await user.save();
    } catch (error) {
      throw new Error(error);
    }
  },

  async viewUsers() {
    try {
      const users = await User.find().populate("role").populate("faculty");
      return users.map(
        ({
          _id,
          username,
          avatar,
          email,
          mobile,
          role,
          faculty,
          updatedAt,
        }) => ({
          _id,
          username,
          avatar,
          email,
          mobile,
          role: role.name,
          faculty: faculty ? faculty.name : null,
          updatedAt,
        })
      );
    } catch (error) {
      throw new Error(error);
    }
  },

  async editUser(userForm, avatar_image) {
    try {
      const user = await User.findById(userForm.id);

      if (!user) {
        throw new Error("User not found");
      }

      if (avatar_image) {
        await cloudinaryService.deleteUserImageFromCloudinary(user.email);
        const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
          avatar_image.buffer,
          user.email
        );
        user.avatar = avatarName;
      }

      user.username = userForm.username;
      user.mobile = userForm.mobile;
      user.password = bcrypt.hashSync(userForm.password);

      const [role, faculty] = await Promise.all([
        RoleService.findRoleByName(userForm.role),
        FacultyService.findFacultyByName(userForm.faculty),
      ]);

      user.role = role;
      user.faculty = faculty;

      return await user.save();
    } catch (error) {
      throw new Error(error);
    }
  },

  async deleteUser(userId) {
    console.log("User ID: " + userId);
    try {
      const user = await User.findById(userId);
      console.log("User: " + user.email);

      if (!user) {
        throw new Error("User not found");
      }

      await cloudinaryService.deleteUserImageFromCloudinary(user.email);

      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = UserService;
