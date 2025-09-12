// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import apiRequest from "../../config/apiRequest.js";

// import "./Chat.css";

// function Chat() {
//   const { user1 } = useParams();
//   const [users, setUsers] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await apiRequest.get("/api/users/getAll");
//         const fetchedUsers = res.data.users || res.data || [];
//         const otherUsers = fetchedUsers.filter(
//           (u) => String(u._id) !== String(user1)
//         );
//         setUsers(otherUsers);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//         setUsers([]);
//       }
//     };

//     fetchUsers();
//   }, [user1]);

//   const handleChat = (chatUserId) => {
//     navigate(`/chat/${user1}/${chatUserId}`);
//   };

//   return (
//     <div className="chat-container">
//       <h1 className="chat-title">Select a User to Chat</h1>

//       <div className="chat-list">
//         {users.length === 0 ? (
//           <p className="empty-text">No other users available.</p>
//         ) : (
//           users.map((user) => (
//             <button
//               key={user._id}
//               className="chat-user-button"
//               onClick={() => handleChat(user._id)}
//             >
//               {user.username}
//             </button>
//           ))
//         )}
//       </div>
//       <Link to="/" style={{ color: "black", textDecoration: "none" }}>
//         Back to Home!
//       </Link>
//     </div>
//   );
// }

// export default Chat;

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../config/apiRequest.js";
import ChatBox from "../ChatBox/ChatBox.jsx";
import "./Chat.css";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//   withCredentials: true,
// });

const Chat = () => {
  const navigate = useNavigate()
  const { user1 } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatID, setChatID] = useState();
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest.get("/api/users/getAll");
        const fetchedUsers = res.data.users || res.data || [];
        console.log("[res.data.users]", res.data);
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
      sender: user1,
      receiver: value,
    });
    console.log("[Response]===>", res.data.chat._id);

    // set selected user (user2) for ChatBox
    setSelectedUser(value);
    setChatID(res.data.chat._id)

    // navigate(`/chat/${user1}/${value}`);
    // // socket.emit("seenMessage", ({chatID: res.data.chat._id, receiver: value}));

    // return () => {
    //   socket.off("seenMessage");
    // };
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
      <ChatBox user1={user1} user2={selectedUser} chatID={chatID} />

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
