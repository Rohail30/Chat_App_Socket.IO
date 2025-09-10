import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiRequest from "../../config/apiRequest.js";
import { io, Socket } from "socket.io-client";
import "./ChatBox.css";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

function ChatBox() {
  const { user1, user2 } = useParams();
  const navigate = useNavigate();

  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await apiRequest.get(`/api/users/${user2}`);
        setReceiver(res.data);  
      } catch (error) {
        console.error("Error fetching partner:", error);
      }
    };

    fetchPartner();
  }, [user2]);

  // 2. Join room once user1 & user2 are known
  useEffect(() => {
    console.log("connected to server: ");
    console.log("User1: ", user1);
    console.log("User2: ", user2);
    socket.emit("joinRoom", { sender: user1, receiver: user2 });

    return () => {
      socket.off();
    };
  }, [user1, user2]);

  // 3. Fetch messages only when receiver is loaded
  useEffect(() => {
    if (!receiver) return;

    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get(
          `/api/chat/${receiver._id}?sender=${user1}`
        );
        console.log("Messages ============> ",res.data);
        setMessage(res.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();
  }, [receiver, user1]);

  const handleSend = () => {
    
  };

  return (
    <div className="chatbox-container">
      {/* Header */}
      <div className="chatbox-header">
        <button
          className="back-button"
          onClick={() => navigate(`/chat/${user1}`)}
        >
          ← Back
        </button>
        <h2 className="chatbox-title">
          Chat with {receiver ? receiver.username : "Loading..."}
        </h2>
      </div>

      {/* Messages area */}
      <div
        className="chatbox-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#f9f9f9",
        }}
      >
        {message?.chat?.messages?.length > 0 ? (
          message.chat.messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.from._id === user1 ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "60%",
                  background: msg.from._id === user1 ? "#4f46e5" : "#e5e7eb",
                  color: msg.from._id === user1 ? "white" : "black",
                  fontSize: "14px",
                }}
              >
                <p>{msg.text}</p>
                <span style={{ fontSize: "10px", opacity: 0.6 }}>
                  {msg.from.username}
                </span>
                <br/>
                <span style={{ fontSize: "10px", opacity: 0.6 }}>
                  {new Date(msg.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p
            className="empty-text"
            style={{ textAlign: "center", color: "#666" }}
          >
            No messages yet. Start chatting 👇
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type your message..."
          // value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
