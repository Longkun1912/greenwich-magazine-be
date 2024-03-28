const config = require("../config/auth.config");
const User = require("../models/user");
const Role = require("../models/role");
const Faculty = require("../models/faculty");
const cloudinaryService = require("../services/cloudinary.service");
const duplicateEmailError = require("../errors/duplicate.email");
const duplicateMobileError = require("../errors/duplicate.mobile");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const avatarFile = req.file;
    const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
      avatarFile.buffer,
      req.body.email
    );

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      throw new duplicateEmailError("This email is already taken");
    }

    const mobileExist = await User.findOne({ mobile: req.body.mobile });
    if (mobileExist) {
      throw new duplicateMobileError("This mobile is already taken");
    }

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      avatar: avatarName,
      mobile: req.body.mobile,
      password: bcrypt.hashSync(req.body.password),
    });

    const studentRole = await Role.findOne({ name: "student" });
    if (!studentRole) {
      return res.status(400).send({ message: "Student role not found!" });
    }
    user.role = studentRole;

    await user.save();
    res.send({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    if (
      err instanceof duplicateEmailError ||
      err instanceof duplicateMobileError
    ) {
      return res.status(400).send({ message: err.message });
    }
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate(
      "role",
      "-__v"
    );

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Incorrect Password!",
      });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
    });

    var role;
    if (user.role) {
      role = user.role.name;
    }

    let facultyName;
    if (user.faculty) {
      const faculty = await Faculty.findOne({ _id: user.faculty });
      if (faculty) {
        facultyName = faculty.name;
      }
    }

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      mobile: user.mobile,
      role: role,
      faculty: facultyName,
      accessToken: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.logout = (req, res) => {
  res.status(200).send({ accessToken: null });
};
