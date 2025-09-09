import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiRequest from "../../config/apiRequest.js";
import "./ChatBox.css";

function ChatBox() {
  const { user1, user2 } = useParams(); 
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await apiRequest.get(`/api/users/${user2}`);
        setPartner(res.data);
      } catch (error) {
        console.error("Error fetching partner:", error);
      }
    };

    fetchPartner();
  }, [user2]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    console.log(`Message to ${partner?.username}:`, newMessage);
    setNewMessage(""); 
  };

  return (
    <div className="chatbox-container">
      {/* Header */}
      <div className="chatbox-header">
        <button className="back-button" onClick={() => navigate(`/chat/${user1}`)}>
          ← Back
        </button>
        <h2 className="chatbox-title">
          Chat with {partner ? partner.username : "Loading..."}
        </h2>
      </div>

      {/* Messages area */}
      <div className="chatbox-messages">
        <p className="empty-text">No messages yet. Start chatting below 👇</p>
      </div>

      {/* Input area */}
      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
