import User from "../schemas/User.js";
import Chat from "../schemas/Chat.js";

export const getChat = async (req, res) => {
  try {
    const { receiver } = req.params;
    const { sender } = req.query;
    
    let chat = await Chat.findOne({
      participants: { $all: [sender, receiver] },
    }).populate("messages.from", "username");

    if (!chat) {
      chat = new Chat({ participants: [sender, receiver], messages: [] }).populate("messages.from", "username");
      await chat.save();
    }

    const messages = chat.messages;

    return res.status(200).json(messages );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const handleSocketMessage = async (data) => {
  let chat = await Chat.findOne({ participants: { $all: [data.sender, data.receiver] }})

  if (!chat) {
    chat = new Chat({participants: [data.sender, data.receiver], messages: [] })

  }

  const message = {from: data.sender, text: data.text};

  chat.messages.push(message);
  chat.populate("messages.from", "username")
  await chat.save();

  // Directly get the last message and populate it
  const lastMessage = await Chat.findById(chat._id)
    .select({ messages: { $slice: -1 } }) // only last one
    .populate("messages.from", "username");

  console.log("[Handle Socket Chat] =======>", lastMessage.messages[0]);

  return lastMessage.messages[0];

}



