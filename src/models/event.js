const mongoose = require("mongoose");
const Contribution = require("./contribution");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    firstDeadLineDate: {
      type: Date,
      required: true,
    },
    finalDeadLineDate: {
      type: Date,
      required: true,
      default: function () {
        const firstDeadLineDate = new Date(this.firstDeadLineDate);
        firstDeadLineDate.setDate(firstDeadLineDate.getDate() + 14); // Add 14 days
        return firstDeadLineDate;
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
