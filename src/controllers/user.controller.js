const { json } = require("express");
const UserService = require("../services/user.service");
const DuplicateEmailError = require("../errors/duplicate.email");
const DuplicateMobileError = require("../errors/duplicate.mobile");

exports.createUser = async (req, res) => {
  try {
    await UserService.createUser(req.body, req.file);
    res.status(200).send("Create user successfully.");
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.viewUsers = async (req, res) => {
  try {
    const users = await UserService.viewUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.viewStudentByFaculty = async (req, res) => {
  try {
    const users = await UserService.viewStudentByFaculty(req.params.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editUser = async (req, res) => {
  try {
    await UserService.editUser(req.body, req.file);
    res.status(200).send("Edit user successfully.");
  } catch (error) {
    if (error instanceof DuplicateMobileError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.updateStudent = async (req, res) => {
  try {
    await UserService.updateStudent(req.body, req.file);
    res.status(200).send("Edit student successfully.");
  } catch (error) {
    if (error instanceof DuplicateMobileError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.deleteUser = async (req, res) => {
  await UserService.deleteUser(req.params.id);
  res.status(200).send("Delete User Content successfully.");
};
