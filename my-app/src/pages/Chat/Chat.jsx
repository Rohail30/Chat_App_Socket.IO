import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiRequest from "../../config/apiRequest.js";

import "./Chat.css";

function Chat() {
  const { user1 } = useParams();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest.get("/api/users/getAll");
        const fetchedUsers = res.data.users || res.data || [];
        const otherUsers = fetchedUsers.filter(
          (u) => String(u._id) !== String(user1)
        );
        setUsers(otherUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [user1]);

  const handleChat = (chatUserId) => {
    navigate(`/chat/${user1}/${chatUserId}`);
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Select a User to Chat</h1>

      <div className="chat-list">
        {users.length === 0 ? (
          <p className="empty-text">No other users available.</p>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              className="chat-user-button"
              onClick={() => handleChat(user._id)}
            >
              {user.username}
            </button>
          ))
        )}
      </div>
      <Link to="/" style={{ color: "black", textDecoration: "none" }}>
        Back to Home!
      </Link>
    </div>
  );
}

export default Chat;
