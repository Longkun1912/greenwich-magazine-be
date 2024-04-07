const Chat = require("../models/chat");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const Role = require("../models/role");
const Message = require("../models/message");
const {
  contactcenteraiplatform,
} = require("googleapis/build/src/apis/contactcenteraiplatform");

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

      const chats = await Promise.all(
        students.map(async (student) => {
          // Find the chat with the student
          const existedChat = await Chat.findOne({
            $or: [
              { user1: currentUser._id, user2: student._id },
              { user1: student._id, user2: currentUser._id },
            ],
          });

          if (existedChat) {
            return existedChat;
          } else {
            // Create a new chat with the student
            return await Chat.create({
              user1: currentUser._id,
              user2: student._id,
            });
          }
        })
      );

      // Get latest message for each chat if it exists
      return await Promise.all(
        chats.map(async (chat) => {
          if (chat) {
            const latestMessage = await Message.findOne({
              chat: chat._id,
            }).sort({ createdAt: -1 });

            const updatedAt = latestMessage
              ? latestMessage.updatedAt
              : chat.updatedAt;

            // Get the other user in the chat
            const otherUser = currentUser._id.equals(chat.user1._id)
              ? chat.user2
              : chat.user1;

            const otherStudent = await User.findById(otherUser);

            return {
              chat: chat._id,
              student: otherStudent,
              latestMessage: latestMessage ? latestMessage.content : "",
              updatedAt,
            };
          }
        })
      );
    } catch (error) {
      throw new Error(error);
    }
  },

  async contactCoordinator(currentUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const faculty = await Faculty.findById(currentUser.faculty);

      if (!faculty) {
        throw new Error("Faculty not found");
      }

      const coordinatorRole = await Role.findOne({ name: "coordinator" });

      if (!coordinatorRole) {
        throw new Error("Coordinator role not found");
      }

      const coordinator = await User.findOne({
        faculty: faculty._id,
        role: coordinatorRole._id,
      });

      if (!coordinator) {
        throw new Error("This faculty does not have a coordinator yet");
      }

      let chat = null;
      // Find the chat with the coordinator no matter who is the user1 or user2
      const existedChat = await Chat.findOne({
        $or: [
          { user1: currentUser._id, user2: coordinator._id },
          { user1: coordinator._id, user2: currentUser._id },
        ],
      });

      if (existedChat) {
        chat = existedChat;
      } else {
        // Create a new chat with the coordinator
        chat = await Chat.create({
          user1: currentUser._id,
          user2: coordinator._id,
        });
      }
      // Get the other user in the chat, which is the coordinator
      const otherUser = currentUser._id.equals(chat.user1._id)
        ? chat.user2
        : chat.user1;
      const otherCoordinator = await User.findById(otherUser);

      // Get messages from chat if it exists
      const messages = await Message.find({ chat: chat._id });

      if (messages && messages.length > 0) {
        return {
          chat: chat._id,
          currentUser: currentUser,
          coordinator: otherCoordinator,
          messages: messages.map((message) => {
            return {
              id: message._id,
              chat: message.chat,
              sender: message.sender,
              content: message.content,
              updatedAt: message.updatedAt,
            };
          }),
        };
      } else {
        return {
          chat: chat._id,
          currentUserName: currentUser,
          coordinator: otherCoordinator,
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = ChatService;
