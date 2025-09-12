import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chat : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Single_Tick","Double_Tick","Blue_Tick"],
        default: "Single_Tick"
    }
})

const Message = mongoose.model("Message", messageSchema);
export default Message;