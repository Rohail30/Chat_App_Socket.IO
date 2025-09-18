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

export const deleteForMe = async (req, res) => {
  try {
    const { messageIds } = req.body; // array of message ids

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: "No message IDs provided" });
    }

    const updated = await Message.updateMany(
      { _id: { $in: messageIds } },  // match all IDs in array
      { $set: { deletedForMe: true } }
    );

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletedForEveryone = async (req, res) => {
  try{
    const { messageIds } = req.body;

    if(!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({error: "No message IDs provided"});
    }

    const updated = await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { deletedForEveryone: true } }
    );

    return res.status(200).json({success: true, updated});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
