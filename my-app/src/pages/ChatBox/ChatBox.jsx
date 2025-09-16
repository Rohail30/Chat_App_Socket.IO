import { useSocket } from "../../config/socketContext.jsx";
import { useEffect, useState, useContext } from "react";
import apiRequest from "../../config/apiRequest.js";

import "./ChatBox.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../config/AuthContext.jsx";

function ChatBox() {
  const socket = useSocket();
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatID, setChatID] = useState();
  const [selectedUser, setSelectedUser] = useState();

  console.log("[Socket]: ",socket);

  useEffect(() => {
    
    socket.on("message_read", (updatedMsgs) => {
      setMessage((prev) =>
        prev.map((msg) => {
          const updated = updatedMsgs.find((u) => u._id === msg._id);
          return updated ? { ...msg, status: updated.status } : msg;
        })
      );
    });

    return () => {
      socket.off("message_read");
    };
  }, []);

  useEffect(() => {
    if (message.length > 0) {
      console.log("Messages updated, marking as seen ✅");

      const hasUnread = message.some(
        (msg) => msg.sender === selectedUser && msg.status !== "Blue_Tick"
      );

      if (hasUnread) {
        socket.emit("seenMessage", {
          chatID: chatID,
          receiver: currentUser,
          sender: selectedUser,
        });
      }

      return () => {
        socket.off("seenMessage");
      };
    }
  }, [chatID, selectedUser, currentUser, message, socket]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest.get("/api/users/getAll");
        const fetchedUsers = res.data.users || res.data || [];
        console.log("[res.data.users]", res.data);
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

  useEffect(() => {
    const fetchPartner = async () => {
      if (!selectedUser) return; // prevent fetch with undefined
      try {
        const res = await apiRequest.get(`/api/users/${selectedUser}`);
        console.log("[Receiver]", res.data);
        setReceiver(res.data);
      } catch (error) {
        console.error("Error fetching partner:", error);
      }
    };

    fetchPartner();
  }, [selectedUser]);

  useEffect(() => {
    console.log("connected to server: ");

    socket.emit("joinRoom", { sender: currentUser, receiver: selectedUser });

    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get(`/api/chat/getMessages/${chatID}`);

        setMessage(res.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", async (msg) => {
      // const res = await apiRequest.put(`/api/chat/updateStatus/${msg._id}`);
      // console.log("[Incomming Message]: ", res.data);
      setMessage((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, selectedUser]);

  const handleSend = (value) => {
    if (!value.trim()) return;
    const data = {
      chat: chatID,
      sender: currentUser,
      receiver: selectedUser,
      message: value,
      date: Date.now(),
      status: "Single_Tick",
    };

    console.log("[Existing Message]: ", message);

    // setMessage((prev) => [...prev, data]);
    socket.emit("sendMessage", data);

    setText("");
  };

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
    <div className="Messenger">
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
                  msg.sender === currentUser ? "sent" : "received"
                }`}
              >
                <div
                  className="message-bubble"
                  style={{
                    background:
                      msg.sender === currentUser ? "#4f46e5" : "#e5e7eb",
                    color: msg.sender === currentUser ? "white" : "black",
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
}

export default ChatBox;
