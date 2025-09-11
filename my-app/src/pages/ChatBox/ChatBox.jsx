import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiRequest from "../../config/apiRequest.js";
import { io } from "socket.io-client";
import "./ChatBox.css";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

function ChatBox() {
  const { user1, user2 } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState([]);

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

  useEffect(() => {
    console.log("connected to server: ");

    socket.emit("joinRoom", { sender: user1, receiver: user2 });

    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get(`/api/chat/${user2}?sender=${user1}`);
        console.log("Messages ============> ", res.data);
        setMessage(res.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      console.log("[Incomming Message]: ", msg);
      setMessage((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user1, user2]);

  const handleSend = (value) => {
    if (!value.trim()) return;
    const data = {
      sender: user1,
      receiver: user2,
      text: value,
    };
    console.log("[Existing Message]: ", message);

    socket.emit("sendMessage", data);

    setText("");
  };

  return (
    // <div className="chatbox-container">
    //   {/* Header */}
    //   <div className="chatbox-header">
    //     <button
    //       className="back-button"
    //       onClick={() => navigate(`/chat/${user1}`)}
    //     >
    //       ← Back
    //     </button>
    //     <h2 className="chatbox-title">
    //       Chat with {receiver ? receiver.username : "Loading..."}
    //       {/* {console.log("[message<---------]",message)} */}
    //     </h2>
    //   </div>

    //   {/* Messages area */}
    //   <div className="chatbox-messages">
    //     {message?.length > 0 ? (
    //       message.map((msg, index) => (
    //         <div
    //           key={index}
    //           style={{
    //             display: "flex",
    //             justifyContent:
    //               msg.from._id === user1 ? "flex-end" : "flex-start",
    //             marginBottom: "8px",
    //           }}
    //         >
    //           <div
    //             style={{
    //               padding: "8px 12px",
    //               borderRadius: "12px",
    //               maxWidth: "80%",
    //               maxHeight: "90%",
    //               background: msg.from._id === user1 ? "#4f46e5" : "#e5e7eb",
    //               color: msg.from._id === user1 ? "white" : "black",
    //               fontSize: "14px",
    //             }}
    //           >
    //             <p>{msg.text}</p>
    //             <span style={{ fontSize: "10px", opacity: 0.6 }}>
    //               {msg.from.username}
    //             </span>
    //             <br />
    //             <span style={{ fontSize: "10px", opacity: 0.6 }}>
    //               {new Date(msg.date).toLocaleTimeString([], {
    //                 hour: "2-digit",
    //                 minute: "2-digit",
    //               })}
    //             </span>
    //           </div>
    //         </div>
    //       ))
    //     ) : (
    //       <p
    //         className="empty-text"
    //         style={{ textAlign: "center", color: "#666" }}
    //       >
    //         No messages yet. Start chatting 👇
    //       </p>
    //     )}
    //   </div>

    //   {/* Input area */}
    //   <div className="chatbox-input">
    //     <input
    //       type="text"
    //       placeholder="Type your message..."
    //       value={text}
    //       // onChange={(e) => setMessage(e.target.value)}
    //       onKeyDown={(e) => {
    //         if (e.key === "Enter") {
    //           handleSend(text); // send message
    //         }
    //       }}
    //       onChange={(e) => setText(e.target.value)}
    //     />
    //     <button onClick={() => handleSend(text)}>Send</button>
    //   </div>
    // </div>
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
      <div className="chatbox-messages">
        {message?.length > 0 ? (
          message.map((msg, index) => (
            <div
              key={index}
              className={`message-wrapper ${
                msg.from._id === user1 ? "sent" : "received"
              }`}
            >
              <div
                className="message-bubble"
                style={{
                  background: msg.from._id === user1 ? "#4f46e5" : "#e5e7eb",
                  color: msg.from._id === user1 ? "white" : "black",
                }}
              >
                <p>{msg.text}</p>
                <span className="username">{msg.from.username}</span>
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
