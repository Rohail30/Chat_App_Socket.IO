import { useSocket } from "../../config/socketContext.jsx";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../config/AuthContext.jsx";
import apiRequest from "../../config/apiRequest.js";
import { RiCheckFill } from "react-icons/ri";
import { PiChecks } from "react-icons/pi";
import "./ChatBox.css";

function ChatBox({ selectedUser, chatID }) {
  const socket = useSocket();
  const { currentUser } = useContext(AuthContext);
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState([]);

  console.log("[Socket]: ", socket);

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

    socket.emit("WhoIsOnline", { sender: currentUser, receiver: selectedUser });

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
      console.log("[Incomming Message]: ", msg);
      setMessage((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, selectedUser]);

  useEffect(() => {
    socket.on("messages_updated", (updatedMsgs) => {
      setMessage((prev) =>
        prev.map((msg) => {
          // check if this msg exists in the updates
          const updated = updatedMsgs.find((u) => u._id === msg._id);
          return updated ? { ...msg, status: updated.status } : msg;
        })
      );
    });

    return () => {
      socket.off("messages_updated");
    };
  }, [socket]);

  const handleSend = (value) => {
    // value.trim() removes spaces from the start and end of the string.
    // !value.trim() checks if the result is empty.
    if (!value.trim()) return;

    const data = {
      chat: chatID,
      sender: currentUser,
      receiver: selectedUser,
      message: value,
      date: Date.now(),
      status: "Single_Tick",
    };

    socket.emit("sendMessage", data);

    setText("");
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
                  <span className="status">
                    {msg.status === "Single_Tick" && <RiCheckFill />}
                    {msg.status === "Double_Tick" && <PiChecks />}
                    {msg.status === "Blue_Tick" && (
                      <PiChecks color="blue" />
                    )}
                  </span>
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
    </div>
  );
}

export default ChatBox;
