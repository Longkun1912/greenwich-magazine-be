const mongoose = require("mongoose");

const Role = require("../models/role");

module.exports = async function () {
  try {
    await Role.create({ name: "admin" });
    await Role.create({ name: "manager" });
    await Role.create({ name: "coordinator" });
    await Role.create({ name: "student" });
    await Role.create({ name: "guest" });
    console.log("Initial roles created successfully!");
  } catch (error) {
    console.error("Error creating roles:", error);
  }
};
