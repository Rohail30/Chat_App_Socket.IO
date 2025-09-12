import { useEffect, useState } from "react";
import apiRequest from "../../config/apiRequest.js";
import { io } from "socket.io-client";
import "./ChatBox.css";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

function ChatBox({ user1, user2, chatID }) {
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState([]);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!user2) return; // prevent fetch with undefined
      try {
        const res = await apiRequest.get(`/api/users/${user2}`);
        console.log("[Receiver]", res.data);
        setReceiver(res.data);
      } catch (error) {
        console.error("Error fetching partner:", error);
      }
    };

    fetchPartner();
  }, [user2]);

  useEffect(() => {
    console.log("connected to server: ");

    socket.emit("joinRoom", { sender: user1, receiver: user2 });

    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get(`/api/chat/getMessages/${chatID}`);
        console.log("Messages ============> ", res.data);
        setMessage(res.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", async (msg) => {
      const message = await apiRequest.put(`/api/chat/updateStatus/${msg._id}`);

      console.log("[Incomming Message]: ", message.data);
      setMessage((prev) => [...prev, message.data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user1, user2]);

  const handleSend = (value) => {
    if (!value.trim()) return;
    const data = {
      chat: chatID,
      sender: user1,
      receiver: user2,
      message: value,
      date: Date.now(),
      status: "Single_Tick",
    };

    console.log("[Existing Message]: ", message);

    // setMessage((prev) => [...prev, data]);
    socket.emit("sendMessage", data);

    setText("");
  };

  return (
    <div className="chatbox-container">
      {/* Header */}
      <div className="chatbox-header">
        <h2 className="chatbox-title">
          {receiver ? receiver.username : "Start Chatting now"}
        </h2>
      </div>

      {/* Messages area */}
      <div className="chatbox-messages">
        {message?.length > 0 ? (
          message.map((msg, index) => (
            <div
              key={index}
              className={`message-wrapper ${
                msg.sender === user1 ? "sent" : "received"
              }`}
            >
              <div
                className="message-bubble"
                style={{
                  background: msg.sender === user1 ? "#4f46e5" : "#e5e7eb",
                  color: msg.sender === user1 ? "white" : "black",
                }}
              >
                <p>{msg.message}</p>
                {/* <span className="username">{msg.sender.username}</span> */}
                <span className="username">{msg.status}</span>
                <br />
                <span className="time">
                  {new Date(msg.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">No messages yet. Start chatting 👇</p>
        )}
      </div>

      {/* Input area */}
      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend(text);
            }
          }}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={() => handleSend(text)}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
