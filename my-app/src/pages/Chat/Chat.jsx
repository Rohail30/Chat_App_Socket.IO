import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../config/apiRequest.js";
import { AuthContext } from "../../config/AuthContext.jsx";
import ChatBox from "../ChatBox/ChatBox.jsx";



import "./Chat.css";

const Chat = () => {
  
  const { currentUser } = useContext(AuthContext);
  const [ users, setUsers ] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [chatID, setChatID] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest.get("/api/users/getAll");
        const fetchedUsers = res.data.users || res.data || [];
        const otherUsers = fetchedUsers.filter(
          (u) => String(u._id) !== String(currentUser)
        );
        setUsers(otherUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
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

  const handleNewChat = async (value) => {
    console.log("==>", value);
    try {
      const res = await apiRequest.post("/api/chat/new", {
        sender: currentUser,
        receiver: value,
      });
      setSelectedUser(value);
      setChatID(res.data.chat._id);

      navigate(`/chat/${currentUser}/${value}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };


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
      <ChatBox selectedUser={selectedUser} chatID={chatID}  />

      {/* Right Sidebar */}
      <div className="sidebar contacts-list">
        <h3>Contacts</h3>
        {users.map((c, i) => (
          <div key={i} className="contact-item">
            <div onClick={(e) => handleNewChat(c._id)}>{c.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
