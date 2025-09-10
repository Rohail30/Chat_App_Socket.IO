import User from "../schemas/User.js";
import Chat from "../schemas/Chat.js";

export const getChat = async (req, res) => {
  try {
    const { receiver } = req.params;
    const { sender } = req.query;
    
    const chat = await Chat.findOne({
      participants: { $all: [sender, receiver] },
    }).populate("messages.from", "username");

    if (!chat) {
      chat = new Chat({ participants: [userId, reciever], messages: [] });
      await chat.save();
    }

    const messages = chat.messages;

    return res.status(200).json({ messages: messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const handleSocketMessage = async (data) => {
  const chat = await Chat.findOne({ participants: { $all: [data.sender, data.receiver] }})

  if (!chat) {
    chat = new Chat({participants: [data.sender, data.receiver], messages: [] })

  }

  const message = {from: data.sender, text: data.text};
  chat.messages.push(message);
  await chat.save();

  return message;

}


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
