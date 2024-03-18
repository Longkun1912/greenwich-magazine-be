const mongoose = require("mongoose");

const Event = require("../models/event");

module.exports = async function () {
  try {
    await Event.create(
      {
        name: "Valentine",
        description: "Event for Valentine",
        firstDeadLineDate: new Date("2024-02-14")
      },
      {
        name: "Women's Day",
        description: "Event for Women's Day",
        firstDeadLineDate: new Date("2024-10-20")
      },
      {
        name: "Lunar New Year",
        description: "Event for Lunar New Year",
        firstDeadLineDate: new Date("2024-02-03")
      },
    );
    console.log("Initial events created successfully!");
  } catch (error) {
    console.error("Error creating events:", error);
  }
};
