const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../models/user.js");
const Role = require("../models/role.js");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Admin Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "manager") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Manager Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isCoordinator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "coordinator") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Coordinator Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "student") {
        next();
        return;
      }
    }
    res.status(403).send({ message: "Require Student Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isGuest = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "guest") {
        next();
        return;
      }
    }
    res.status(403).send({ message: "Require Guest Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isAdminOrManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin" || roles[i].name === "manager") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Admin or Manager Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isCoordinatorOrStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const roles = await Role.find({ _id: { $in: user.role } });
    if (!roles) {
      return res.status(404).send({ message: "Roles not found!" });
    }

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "coordinator" || roles[i].name === "student") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Coordinator or Student Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isManager,
  isCoordinator,
  isStudent,
  isGuest,
  isAdminOrManager,
  isCoordinatorOrStudent,
};

module.exports = authJwt;
