import { useSocket } from "../../config/socketContext.jsx";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../config/AuthContext.jsx";
import apiRequest from "../../config/apiRequest.js";
import { RiCheckFill } from "react-icons/ri";
import { PiChecks } from "react-icons/pi";
import { CiMenuKebab } from "react-icons/ci";
import { MdOutlineDelete, MdOutlineCancel } from "react-icons/md";
import "./ChatBox.css";
import ChatHeader from "./Components/ChatHeader.jsx";
import ChatInput from "./components/ChatInput.jsx";

function ChatBox({ selectedUser, chatID }) {
  const socket = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Local State
  const [text, setText] = useState(""); // message input field
  const [receiver, setReceiver] = useState(null); // receiver user details
  const [message, setMessage] = useState([]); // chat messages
  const [menuOpen, setMenuOpen] = useState(false); // 3-dots menu toggle
  const [selectionMode, setSelectionMode] = useState(false); // enables selecting messages
  const [selectedMessages, setSelectedMessages] = useState([]); // selected messages for deletion
  const [deleteOptions, setDeleteOptions] = useState(false); // delete menu toggle

  /**
   * @Type Socket + API
   * @Desc Fetch previous messages + listen for incoming messages
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiRequest.get(`/api/chat/getMessages/${chatID}`);
        setMessage(res.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();
  }, [currentUser, selectedUser, selectedMessages]);

  /**
   * @Type Socket
   * @Desc listen for incoming messages "receiveMessage"
   */
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      console.log("[Incoming Message]: ", msg);
      setMessage((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser]);

  /**
   * @Type Socket
   * @Desc Update ticks (Single → Double → Blue) when "message_read" received
   */
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

  /**
   * @Type Socket
   * @Desc Emit "seenMessage" when user views unread messages
   */
  useEffect(() => {
    if (message.length > 0) {
      const hasUnread = message.some(
        (msg) => msg.sender === selectedUser && msg.status !== "Blue_Tick"
      );

      if (hasUnread) {
        socket.emit("seenMessage", {
          chatID,
          receiver: currentUser,
          sender: selectedUser,
        });
      }

      return () => {
        socket.off("seenMessage");
      };
    }
  }, [chatID, selectedUser, currentUser, message, socket]);

  /**
   * @Type API
   * @Desc Fetch chat partner (receiver) info
   */
  useEffect(() => {
    const fetchPartner = async () => {
      if (!selectedUser) return;
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

  /**
   * @Type Socket
   * @Desc Emit "WhoIsOnline" when chat starts
   */
  useEffect(() => {
    socket.emit("WhoIsOnline", { sender: currentUser, receiver: selectedUser });

    return () => {
      socket.off("WhoIsOnline");
    };
  }, [currentUser]);

  /**
   * @Type Socket
   * @Desc Join chat room with currentUser & selectedUser
   */
  useEffect(() => {
    socket.emit("joinRoom", { sender: currentUser, receiver: selectedUser });

    return () => {
      socket.off("joinRoom");
    };
  }, [currentUser, selectedUser, selectedMessages]);

  /**
   * @Type Socket
   * @Desc Update messages in bulk when server sends "messages_updated"
   */
  useEffect(() => {
    socket.on("messages_updated", (updatedMsgs) => {
      console.log("[messages_updated Messages]", updatedMsgs);
      setMessage((prev) =>
        prev.map((msg) => {
          const updated = updatedMsgs.find((u) => u._id === msg._id);
          return updated ? { ...msg, status: updated.status } : msg;
        })
      );
    });

    return () => {
      socket.off("messages_updated");
    };
  }, [socket]);

  /**
   * @Type Socket
   * @Desc Update messages in bulk when server sends "deleteForMe"
   */
  useEffect(() => {
    socket.on("forMeDeleted", (deletedMessages) => {
      console.log("[forMeDeleted Messages]", deletedMessages);
      setMessage((prev) =>
        prev.map((msg) => {
          const updated = deletedMessages.find((u) => u._id === msg._id);
          return updated ? { ...msg, status: updated.status } : msg;
        })
      );
    });

    return () => {
      socket.off("forMeDeleted");
    };
  }, [selectedMessages]);

  /**
   * @Type Socket
   * @Desc Update messages in bulk when server sends "deleteForEveryone"
   */
  useEffect(() => {
    socket.on("forEveryoneDeleted", (deletedMessages) => {
      console.log("[forEveryoneDeleted Messages]", deletedMessages);
      setMessage((prev) =>
        prev.map((msg) => {
          const updated = deletedMessages.find((u) => u._id === msg._id);
          return updated ? { ...msg, ...updated } : msg;
        })
      );
    });

    return () => {
      socket.off("forEveryoneDeleted");
    };
  }, [chatID, selectedUser, currentUser, message, socket]);

  // ✅ Toggle message selection
  const toggleSelectMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  // ✅ Enable delete mode
  const handleDeleteChat = () => {
    setSelectionMode(true);
    setSelectedMessages([]);
  };

  // ✅ Delete for me
  const handleDeleteForMe = async () => {
    console.log("[Current-User && receiver]", currentUser, receiver._id);

    if (selectedMessages) {
      socket.emit("deleteForMe", {
        messages: selectedMessages,
        sender: currentUser,
        receiver: receiver._id,
      });
    }
    setSelectionMode(false);
    setMenuOpen(false);
    setDeleteOptions(false);
    setSelectedMessages([]);
  };

  // ✅ Delete for everyone
  const handleDeleteForAll = async () => {
    if (selectedMessages) {
      socket.emit("deleteForEveryone", {
        messages: selectedMessages,
        sender: currentUser,
        receiver: receiver._id,
      });
    }

    setSelectionMode(false);
    setMenuOpen(false);
    setDeleteOptions(false);
    setSelectedMessages([]);
  };

  // ✅ Toggle chatbox 3-dots menu
  const handleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // ✅ Send message
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

    socket.emit("sendMessage", data);
    setText("");
  };

  return (
    <div className="Messenger">
      <div className="chatbox-container">
        {/* ---------------- Header ---------------- */}
        {/* <ChatHeader
          receiver={receiver}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          menuOpen={menuOpen}
          handleMenu={handleMenu}
          handleDeleteChat={handleDeleteChat}
        /> */}
        <div className="chatbox-header">
          <h2 className="chatbox-title">
            {receiver ? receiver?.username : "Start Chatting now"}
          </h2>

          <div className="chatbox-actions">
            {selectionMode ? (
              <>
                {/* Delete & Cancel buttons in selection mode */}
                <button onClick={() => setDeleteOptions(true)}>
                  <MdOutlineDelete style={{ fontSize: "25px" }} />
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setMenuOpen(false);
                    setDeleteOptions(false);
                  }}
                >
                  <MdOutlineCancel style={{ fontSize: "25px" }} />
                </button>
              </>
            ) : (
              selectedUser && (
                <>
                  {/* 3-dots menu */}
                  <CiMenuKebab
                    onClick={handleMenu}
                    style={{ cursor: "pointer" }}
                  />
                  {menuOpen && (
                    <div className="chatbox-menu">
                      <ul>
                        <li onClick={handleDeleteChat}>Delete Chat</li>
                        <li>Block User</li>
                        <li>View Profile</li>
                      </ul>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {/* ---------------- Delete Options ---------------- */}
        {deleteOptions && selectedMessages.length > 0 && (
          <div className="delete-options">
            <button onClick={handleDeleteForMe}>Delete for me</button>
            {selectedMessages.every(
              (id) => message.find((m) => m._id === id)?.sender === currentUser
            ) && (
              <button onClick={handleDeleteForAll}>Delete for Everyone</button>
            )}
          </div>
        )}

        {/* ---------------- Messages Area ---------------- */}
        <div className="chatbox-messages">
          {message?.length > 0 ? (
            message.map((msg) => (
              <div
                key={msg._id}
                className={`message-wrapper ${
                  msg.sender === currentUser ? "sent" : "received"
                }`}
                onClick={() => selectionMode && toggleSelectMessage(msg._id)}
                style={{
                  background: selectedMessages.includes(msg._id)
                    ? "#444"
                    : "transparent",
                  cursor: selectionMode ? "pointer" : "default",
                }}
              >
                {selectionMode && !msg.deletedForEveryone && (
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(msg._id)}
                    onChange={() => toggleSelectMessage(msg._id)}
                  />
                )}

                {!msg.deletedForEveryone && (
                  <div
                    className="message-bubble"
                    style={{
                      background:
                        msg.sender === currentUser ? "#C4EFC4" : "#e5e7eb",
                      color: msg.sender === currentUser ? "white" : "black",
                    }}
                  >
                    {/* Handle delete logic in UI */}
                    <p>
                      {msg.deletedForMe && msg.sender === currentUser
                        ? "This message was deleted"
                        : msg.message}
                    </p>

                    {/* Message Status (ticks) */}
                    <span className="status">
                      {msg.status === "Single_Tick" && <RiCheckFill />}
                      {msg.status === "Double_Tick" && <PiChecks />}
                      {msg.status === "Blue_Tick" && <PiChecks color="blue" />}
                    </span>

                    <br />

                    {/* Message Time */}
                    <span className="time">
                      {new Date(msg.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-text">No messages yet. Start chatting 👇</p>
          )}
        </div>

        {/* ---------------- Input Area ---------------- */}
        {/* {selectedUser && (
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={text}
              onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={() => handleSend(text)}>Send</button>
          </div>
        )} */}
        <ChatInput text={text} setText={setText} handleSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatBox;
