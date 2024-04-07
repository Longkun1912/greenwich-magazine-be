const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contribution: {
    type: mongoose.Schema.Types.String,
    ref: "Contribution",
    required: true,
  },  
},
{
    timestamps: true,
}
);
module.exports = mongoose.model("Comment", commentSchema);