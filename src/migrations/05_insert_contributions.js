const mongoose = require("mongoose");

const User = require("../models/user");
const Event = require("../models/event");
const Contribution = require("../models/contribution");
module.exports = async function () {

    const users = await User.find();
    const events = await Event.find();
    const contributions = [
        {
          title: "Contribution 1",
          content: "Content of Contribution 1",
          document: "Document 1",
          image: "Image 1",
          status: "pending",
          submitter:  users.find((user) => user.username === "IT Student")._id , 
          event:  events.find((event) => event.name === "Valentine")._id,
        },
        {
          title: "Contribution 2",
          content: "Content of Contribution 2",
          document: "Document 2",
          image: "Image 2",
          status: "pending",
          submitter:  users.find((user) => user.username === "IT Student")._id, 
          event:  events.find((event) => event.name === "Women's Day")._id,
        },
        {
          title: "Contribution 3",
          content: "Content of Contribution 3",
          document: "Document 3",
          image: "Image 3",
          status: "pending",
          submitter:  users.find((user) => user.username === "IT Student")._id, 
          event:  events.find((event) => event.name === "Lunar New Year")._id,
        },
    ];
      await Contribution.create(contributions)
        .then(() => {
          console.log("Contributions inserted successfully!");
        })
        .catch((error) => {
          console.error("Error inserting contributions:", error);
        });
};
