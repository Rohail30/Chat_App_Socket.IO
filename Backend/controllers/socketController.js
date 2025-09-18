import Message from "../schemas/Message.js";

export const updateMessageStatus = async (chatID) => {
  const messageID = chatID;
  const message = await Message.findOneAndUpdate(
    { chat: messageID },
    { $set: { status: "Double_Tick" } },
    { new: true }
  ).sort({ createdAt: -1 });
  return message;
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
  await Message.updateMany(
    { chat: chatID, receiver: receiver }, // filter
    { $set: { status: "Blue_Tick" } } // update
  );
  const updatedMessages = await Message.find({ chat: chatID });
  return updatedMessages;
};



export const DoubleTick = async ({ sender, receiver }) => {
  // Update status
  const result = await Message.updateMany(
    { sender: receiver, receiver: sender, status: "Single_Tick" },
    { $set: { status: "Double_Tick" } }
  );

  // Only fetch the ones that were updated in this call
  if (result.modifiedCount > 0) {
    const updatedMessages = await Message.find({
      sender: receiver,
      receiver: sender,
      status: "Double_Tick",
    })
      .sort({ date: -1 })
      .limit(result.modifiedCount); // only the newly updated ones

    return updatedMessages;
  }

  return [];
};

export const deleteForMe = async ({ messages }) => {
  const updated = await Message.updateMany(
    { _id: { $in: messages } },
    { $set: { deletedForMe: true } }
  );

  if (updated.modifiedCount > 0) {
    const updatedMessages = await Message.find({
      _id: { $in: messages }
    });

    return updatedMessages;
  }

  return [];
};

export const deleteForEveryone = async ({ messages }) => {
  const updated = await Message.updateMany(
    { _id: { $in: messages } },
    { $set: { deletedForEveryone: true } }
  );

  if (updated.modifiedCount > 0) {
    const updatedMessages = await Message.find({
      _id: { $in: messages }
    });

    return updatedMessages;
  }

  return [];
};