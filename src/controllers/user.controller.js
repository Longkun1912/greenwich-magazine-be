const { json } = require("express");
const UserService = require("../services/user.service");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.createUser = (req, res) => {
  UserService.createUser(req.body, req.file);
  res.status(200).send("Create User Content successfully.");
};

exports.viewUsers = async (req, res) => {
  const users = await UserService.viewUsers();
  res.status(200).json(users);
};

exports.editUser = (req, res) => {
  UserService.editUser(req.body, req.file);
  res.status(200).send("Edit User Content successfully.");
};

exports.managerBoard = (req, res) => {
  res.status(200).send("Manager Content.");
};

exports.coordinatorBoard = (req, res) => {
  res.status(200).send("Coordinator Content.");
};

exports.studentBoard = (req, res) => {
  res.status(200).send("Student Content.");
};

exports.guestBoard = (req, res) => {
  res.status(200).send("Guest Content.");
};
