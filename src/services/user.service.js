var bcrypt = require("bcryptjs");
const User = require("../models/user");
const Role = require("../models/role");

const UserService = {
  async createUser(userForm, avatar_image) {
    const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
      avatar_image.buffer,
      userForm.email
    );

    const user = new User({
      username: userForm.username,
      email: userForm.email,
      avatar: avatarName,
      mobile: userForm.mobile,
      password: bcrypt.hashSync(userForm.password),
      role: userForm.role,
      faculty: userForm.faculty,
    });

    try {
      return await user.save();
    } catch (error) {
      throw new Error(error);
    }
  },

  async viewUsers() {
    try {
      const users = await User.find().populate("role").populate("faculty");
      return users.map(
        ({ _id, username, email, mobile, role, faculty, updatedAt }) => ({
          _id,
          username,
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
};

module.exports = UserService;
