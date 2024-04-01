var bcrypt = require("bcryptjs");
const RoleService = require("../services/role.service");
const FacultyService = require("../services/faculty.service");
const User = require("../models/user");
const cloudinaryService = require("../services/cloudinary.service");
const DuplicateEmailError = require("../errors/duplicate.email");
const DuplicateMobileError = require("../errors/duplicate.mobile");

const UserService = {
  async createUser(userForm, avatar_image) {
    try {
      const user = new User({
        username: userForm.username,
        email: userForm.email,
        mobile: userForm.mobile,
        password: bcrypt.hashSync(userForm.password),
      });

      // Check duplicate email
      const emailExist = await User.findOne({ email: userForm.email });
      if (emailExist) {
        throw new DuplicateEmailError("This email is already taken");
      }

      // Check duplicate mobile
      const mobileExist = await User.findOne({ mobile: userForm.mobile });
      if (mobileExist) {
        throw new DuplicateMobileError("This mobile is already taken");
      }

      const [role, faculty] = await Promise.all([
        RoleService.findRoleByName(userForm.role),
        FacultyService.findFacultyByName(userForm.faculty),
      ]);

      user.role = role;
      user.faculty = faculty;

      if (avatar_image) {
        const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
          avatar_image.buffer,
          userForm.email
        );
        user.avatar = avatarName;
      }

      await user.save();
      return user;
    } catch (error) {
      throw new Error(error);
    }
  },

  async viewUsers() {
    try {
      const users = await User.find().populate("role").populate("faculty");

      const systemUsers = users.map(
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

      // Remove admin role from the list
      return systemUsers.filter((user) => user.role !== "admin");
    } catch (error) {
      throw new Error(error);
    }
  },

  async viewStudentByFaculty(coordinatorId) {
    try {
      const coordinator = await User.findById(coordinatorId);
      const facultyId = coordinator.faculty;
      const studentRole = await RoleService.findRoleByName("student");
      const users = await User.find({
        faculty: facultyId,
        role: studentRole._id,
      });

      return users.map(({ _id, username, avatar, email, mobile }) => ({
        _id,
        username,
        avatar,
        email,
        mobile,
      }));
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

      // Check duplicate mobile but not for the current user
      const mobileExist = await User.findOne({ mobile: userForm.mobile });
      if (mobileExist && mobileExist._id.toString() !== userForm.id) {
        throw new DuplicateMobileError("This mobile is already taken");
      }

      user.username = userForm.username;
      user.mobile = userForm.mobile;

      if (userForm.password && userForm.password.length > 0) {
        user.password = bcrypt.hashSync(userForm.password);
      }

      const [role, faculty] = await Promise.all([
        RoleService.findRoleByName(userForm.role),
        FacultyService.findFacultyByName(userForm.faculty),
      ]);

      user.role = role;
      user.faculty = faculty;

      if (avatar_image) {
        await cloudinaryService.deleteUserImageFromCloudinary(user.email);
        const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
          avatar_image.buffer,
          user.email
        );
        user.avatar = avatarName;
      }

      return await user.save();
    } catch (error) {
      throw new Error(error);
    }
  },

  async updateStudent(userForm, avatar) {
    try {
      const user = await User.findById(userForm.id);

      if (!user) {
        throw new Error("User not found");
      }
      user.username = userForm.username;

      if (userForm.password && userForm.password.length > 0) {
        user.password = bcrypt.hashSync(userForm.password);
      }

      // Check duplicate mobile but not for the current user
      const mobileExist = await User.findOne({ mobile: userForm.mobile });
      if (mobileExist && mobileExist._id.toString() !== userForm.id) {
        throw new DuplicateMobileError("This mobile is already taken");
      }
      user.mobile = userForm.mobile;

      if (avatar) {
        await cloudinaryService.deleteUserImageFromCloudinary(user.email);
        const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
          avatar.buffer,
          user.email
        );
        user.avatar = avatarName;
      }

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

      if (user.avatar) {
        await cloudinaryService.deleteUserImageFromCloudinary(user.email);
      }

      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = UserService;
