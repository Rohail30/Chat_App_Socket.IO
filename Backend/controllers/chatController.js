import User from "../schemas/User.js";
import Chat from "../schemas/Chat.js";

export const getChat = async (req, res) => {
  try {
    const { receiver } = req.params;
    const { sender } = req.query;
    console.log("[receiver] ===> ", receiver);
    console.log("[sender] ===> ", sender);
    const chat = await Chat.findOne({
      participants: { $all: [sender, receiver] },
    }).populate("messages.from", "username");
    if (!chat) {
      chat = new Chat({ participants: [userId, reciever], messages: [] });
      await chat.save();
    }
    return res.status(200).json({ message: "ok", chat });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleSocketMessages = async (io, socket, { sender, receiver, text }) => {
  const roomId = [sender, receiver].sort().join("_");

  let chat = await Chat.findOne({ participants: { $all: [sender, receiver] } });

  if (!chat) {
    chat = new Chat({ participants: [sender, receiver], messages: [] });
  }

  const message = { from: sender, text };
  chat.messages.push(message);
  await chat.save();

  await chat.populate("messages.from", "name");
  const populatedMessage = chat.messages[chat.messages.length - 1];

  io.to(roomId).emit("receiveMessage", populatedMessage);
};

export const handleSocketMessage = async()

export const getChatUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ participants: userId });

    const userIds = [];
    chats.forEach((chat) => {
      chat.participants.forEach((participant) => {
        const participantId = participant.toString();
        if (
          participantId !== userId.toString() &&
          !userIds.includes(participantId)
        ) {
          userIds.push(participantId);
        }
      });
    });

    const users = await User.find({ _id: { $in: userIds } }).populate(
      "name email"
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
