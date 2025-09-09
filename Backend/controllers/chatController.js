import User from "../schemas/User";
import Chat from "../../my-app/src/pages/Chat/Chat";

const getChat = async (req, res) => {
  const userId = req.userId;
  const reciever = req.params.reciever;

  if (!userId || !reciever) {
    return res.status(400).json({ error: true, message: 'Sender and Reciever are required' });
  }

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, reciever] }, })
      .populate('messages.from', 'name');

    if (!chat) {
      chat = new Chat({ participants: [userId, reciever], messages: [], });
      await chat.save();
    }

    return res.status(200).json(chat ? chat.messages : []);
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};



const handleSocketMessage = async (io, socket, { sender, receiver, text }) => {
  const roomId = [sender, receiver].sort().join('_');

  let chat = await Chat.findOne({ participants: { $all: [sender, receiver] }, });

  if (!chat) {
    chat = new Chat({ participants: [sender, receiver], messages: [], });
  }

  const message = { from: sender, text };
  chat.messages.push(message);
  await chat.save();

  await chat.populate('messages.from', 'name');
  const populatedMessage = chat.messages[chat.messages.length - 1];

  io.to(roomId).emit('receiveMessage', populatedMessage);
};



const getChatUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ participants: userId });

    const userIds = [];
    chats.forEach((chat) => {
      chat.participants.forEach((participant) => {
        const participantId = participant.toString();
        if (participantId !== userId.toString() && !userIds.includes(participantId)) {
          userIds.push(participantId);
        }
      });
    });

    const users = await User.find({ _id: { $in: userIds } })
      .populate('name email')

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getChat, handleSocketMessage, getChatUsers };
