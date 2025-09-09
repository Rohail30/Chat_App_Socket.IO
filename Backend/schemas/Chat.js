import mongoose from "mongoose"

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    messages: [
        {
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            text: String,
            date: {
                type: Date,
                default: Date.now
            },
        },
    ],
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;