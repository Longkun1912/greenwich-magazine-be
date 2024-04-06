const Chat = require("../models/chat");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const Role = require("../models/role");
const Message = require("../models/message");

const ChatService = {
  async createChat(user1Id, user2Id) {
    try {
      const user1 = await User.findById(user1Id);
      const user2 = await User.findById(user2Id);

      if (!user1 || !user2) {
        throw new Error("User not found");
      }

      const chat = await Chat.create({ user1, user2 });
      return chat;
    } catch (error) {
      throw new Error(error);
    }
  },

  async getStudentsInFacultyForChat(currentUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const faculty = await Faculty.findById(currentUser.faculty);

      if (!faculty) {
        throw new Error("Faculty not found");
      }

      const studentRole = await Role.findOne({ name: "student" });

      if (!studentRole) {
        throw new Error("Student role not found");
      }

      const students = await User.find({
        faculty: faculty._id,
        role: studentRole._id,
      });

      return students.map((student) => {
        // Find the chat with the student
        const chat = Chat.findOne({
          $or: [
            { user1: currentUser._id, user2: student._id },
            { user1: student._id, user2: currentUser._id },
          ],
        });

        if (!chat) {
          return {
            _id: student._id,
            name: student.username,
            email: student.email,
            faculty: student.faculty,
          };
        }

        const latestMessage = chat.messages[0].content;
        const updatedAt = chat.updatedAt;

        return {
          _id: student._id,
          name: student.username,
          email: student.email,
          faculty: student.faculty,
          latestMessage,
          updatedAt,
        };
      });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = ChatService;
