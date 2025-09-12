import mongoose from "mongoose"

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    } 
});

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;