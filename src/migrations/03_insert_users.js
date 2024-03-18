const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");
const Faculty = require("../models/faculty");

module.exports = async function () {
  try {
    const roles = await Role.find();
    const faculties = await Faculty.find();

    // Administrator, email: admintch2022@fpt.edu.vn, password: admin123
    await User.create({
      avatar: "https://cdn-icons-png.freepik.com/512/3934/3934107.png",
      username: "Administrator",
      email: "admintch2022@fpt.edu.vn",
      mobile: "01663403287",
      password: "$2a$12$6MMjtbZbLCMe/d/8hialy.OmsrCMo68YF3zF8GXqMV6tmUFWI.LSu",
      role: roles.find((role) => role.name === "admin")._id,
      faculty: null,
    });

    // Marketing Manager, email: managertch2022@fpt.edu.vn, password: manager123
    await User.create({
      avatar: "https://cdn-icons-png.freepik.com/512/3934/3934107.png",
      username: "Marketing Manager",
      email: "managertch2022@fpt.edu.vn",
      mobile: "0396681233",
      password: "$2a$12$7SIMdWf0epYsUo.QjIYWVueb7UQzKMW90XW0V0nxuIU0K6aOHdD06",
      role: roles.find((role) => role.name === "manager")._id,
      faculty: null,
    });

    // Marketing Coordinator, email: itcoordinator@fpt.edu.vn, password: coordinator123
    await User.create({
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoa1dGnCwr3FaAXyG4DAc4D9FWeqOwNxQSSVJs-KM2oAnbHZ4uW7Rhi1iNQBFE3p45o-8&usqp=CAU",
      username: "IT Coordinator",
      email: "itcoordinator@fpt.edu.vn",
      mobile: "0936272186",
      password: "$2a$12$WTKae.pvccliCDpzG3h.dO.CsWb8FUxUQvJC6L9nuib9.ZUjKXw2W",
      role: roles.find((role) => role.name === "coordinator")._id,
      faculty: faculties.find(
        (faculty) => faculty.name === "Information Technology"
      )._id,
    });

    // IT Student, email: itstudent@fpt.edu.vn, password: student123
    await User.create({
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeJo5wfYzSEGqHXAC9QkTqj32Vk6q7Ppr9uw&usqp=CAU",
      username: "IT Student",
      email: "itstudent@fpt.edu.vn",
      mobile: "0134272139",
      password: "$2a$12$XJERmo.2mNe8Ng4IWQaBVuWyXl4kNbokZed7SMfJIkWVEptWOwJEm",
      role: roles.find((role) => role.name === "student")._id,
      faculty: faculties.find(
        (faculty) => faculty.name === "Information Technology"
      )._id,
    });

    // IT Guest, email: itguest@fpt.edu.vn, password: guest123
    await User.create({
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeJo5wfYzSEGqHXAC9QkTqj32Vk6q7Ppr9uw&usqp=CAU",
      username: "IT Guest",
      email: "itguest@fpt.edu.vn",
      mobile: "023456789",
      password: "$2a$12$b9k4qHrKY7IMrydqOJ5LU.5X4LEmO1nCQFQFMbUN9DVzVmOWTrPou",
      role: roles.find((role) => role.name === "guest")._id,
      faculty: faculties.find(
        (faculty) => faculty.name === "Information Technology"
      )._id,
    });

    console.log("Sample users created successfully!");
  } catch (error) {
    console.error("Error creating users:", error);
  }
};
