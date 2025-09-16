import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../config/apiRequest.js";
import ChatBox from "../ChatBox/ChatBox.jsx";
import { AuthContext } from "../../config/AuthContext.jsx";

import "./Chat.css";

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  // const { users, setUsers } = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest.get("/api/users/getAll");
        const fetchedUsers = res.data.users || res.data || [];
        console.log("[res.data.users]", res.data);
        console.log("currentUser===> ", currentUser);
        const otherUsers = fetchedUsers.filter(
          (u) => String(u._id) !== String(currentUser)
        );
        // setUsers(otherUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // setUsers([]);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const [chats] = useState([
    { id: 1, name: "Alice", lastMessage: "Hey, how are you?" },
    { id: 2, name: "Bob", lastMessage: "Let's meet tomorrow." },
    { id: 3, name: "Charlie", lastMessage: "Cool, see you soon!" },
  ]);

  const [contacts] = useState([
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
  ]);

  const [messages] = useState([
    { id: 1, sender: "Alice", text: "Hello!", self: false },
    { id: 2, sender: "Me", text: "Hi Alice 👋", self: true },
    { id: 3, sender: "Alice", text: "How’s it going?", self: false },
    { id: 4, sender: "Me", text: "All good, what about you?", self: true },
  ]);

  return (
    <div className="chatapp-container">
      {/* Left Sidebar */}
      <div className="sidebar chats-list">
        <h3>Chats</h3>
        {chats.map((chat) => (
          <div key={chat.id} className="chat-item">
            <strong>{chat.name}</strong>
            <p>{chat.lastMessage}</p>
          </div>
        ))}
        <Link to="/Login" style={{ color: "White", textDecoration: "none" }}>
          Back to Login!
        </Link>
      </div>

      {/* Middle Messages Area */}
      {/* <div className="chat-area">
        <div className="chat-header">Chat with Alice</div>
        <div className="messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.self ? "self" : "other"}`}
            >
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div> */}

      <ChatBox />

      {/* Right Sidebar */}
      {/* <div className="sidebar contacts-list">
        <h3>Contacts</h3>
        {users.map((c, i) => (
          <div key={i} className="contact-item">
            <div onClick={(e) => handleNewChat(c._id)}>{c.username}</div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Chat;
