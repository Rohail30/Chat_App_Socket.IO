import Chat from "../schemas/Chat.js";
import Message from "../schemas/Message.js";

export const getMessages = async (req, res) => {
  try {
    const id = req.params.id;

    let chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    let messages = await Message.find({ chat: id });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateMessageStatus = async (req, res) => {
  const messageID = req.params.id;
  console.log('[MessageID',messageID);
  const message = await Message.findOneAndUpdate(
    { _id: messageID },
    { $set: { status: "Double_Tick" } },
    { new: true }
  );
  console.log('[Message]',message);
  return res.status(200).json(message);
};

export const newChat = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    let chat = await Chat.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [sender, receiver],
      });
    }

    return res
      .status(200)
      .json({ Message: "New Chat created Successfully", chat });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleSocketMessage = async (data) => {
  const message = await Message.create({
    chat: data.chat,
    sender: data.sender,
    receiver: data.receiver,
    message: data.message,
  });

  return message;
};

export const handleReadStatus = async ({ chatID, receiver }) => {
  console.log("[Data]===>", chatID, receiver);

  let message = await Message.updateMany(
    { chat: chatID, receiver: receiver }, // filter
    { $set: { status: "Blue_Tick" } } // update
  );

  console.log("[Updated]===>", message);

  const updatedMessages = await Message.find({ chat: chatID, receiver });

  console.log("[Updated Messages]===>", updatedMessages);
  // const message = await Message.findByIdAndUpdate(
  //   messageID,
  //   { status: "Blue_Tick" },
  //   { new: true } // return updated doc
  // );
  return message;
};
