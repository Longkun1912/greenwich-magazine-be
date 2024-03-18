const config = require("../config/auth.config");
const User = require("../models/user");
const Role = require("../models/role");
const Faculty = require("../models/faculty");
const cloudinaryService = require("../services/cloudinary.service");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const avatarFile = req.file;
  console.log(avatarFile);
  const avatarName = await cloudinaryService.uploadUserAvatarToCloudinary(
    avatarFile.buffer,
    req.body.email
  );

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    avatar: avatarName,
    mobile: req.body.mobile,
    password: bcrypt.hashSync(req.body.password),
  });

  try {
    const studentRole = await Role.findOne({ name: "student" });
    if (!studentRole) {
      return res.status(400).send({ message: "Student role not found!" });
    }
    user.role = studentRole;

    await user.save();
    res.send({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
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
