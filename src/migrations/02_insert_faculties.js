const mongoose = require("mongoose");

const Faculty = require("../models/faculty");

module.exports = async function () {
  try {
    await Faculty.create(
      {
        name: "Information Technology",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-vQ5EeNvTWXeTZkMetT9TtO-VXZR9Ke8rpg&usqp=CAU",
        description: "Faculty for IT students",
      },
      {
        name: "Art Design",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9F-GauFRMHOx2aiaLJhlLQl2WRU053KDpDA&usqp=CAU",
        description: "Faculty for Art Design students",
      },
      {
        name: "Business Management",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST_IbmBG6wYdDCNErjuu6VesfxZ_X6mc8Dxg&usqp=CAU",
        description: "Faculty for Business Management students",
      }
    );
    console.log("Initial faculties created successfully!");
  } catch (error) {
    console.error("Error creating faculties:", error);
  }
};
