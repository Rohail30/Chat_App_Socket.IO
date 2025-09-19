import { useSocket } from "../../config/socketContext.jsx";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../config/AuthContext.jsx";
import { db } from "../../db/db.ts";
import { useLiveQuery } from "dexie-react-hooks";
import apiRequest from "../../config/apiRequest.js";
import ChatHeader from "./Components/ChatHeader.jsx";
import ChatInput from "./components/ChatInput.jsx";
import MessageList from "./components/MessageList.jsx";
import DeleteOptions from "./components/DeleteOptions.jsx";
import "./ChatBox.css";

function ChatBox({ selectedUser, chatID }) {
  const socket = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Get all messages from IndexedDB (live updating)
  const messages = useLiveQuery(() => db.messages.toArray(), []);

  // Local State
  const [text, setText] = useState(""); // message input field
  const [receiver, setReceiver] = useState(null); // receiver user details
  const [message, setMessage] = useState([]); // chat messages
  const [menuOpen, setMenuOpen] = useState(false); // 3-dots menu toggle
  const [selectionMode, setSelectionMode] = useState(false); // enables selecting messages
  const [selectedMessages, setSelectedMessages] = useState([]); // selected messages for deletion
  const [deleteOptions, setDeleteOptions] = useState(false); // delete menu toggle
  const [isTyping, setIsTyping] = useState("");
  const [lastRoom, setLastRoom] = useState("");

  console.log("[IsTYPING VLAUE]==>",isTyping);

  /**
   * @Type Socket
   * @Desc Join chat room with currentUser & selectedUser
   */
  useEffect(() => {
    const roomID = [currentUser, selectedUser].sort().join("_");
    setLastRoom(roomID);

    if (lastRoom) {
      socket.emit("leave_room", lastRoom);
    }
    socket.emit("joinRoom", roomID);

    return () => {
      socket.emit("leave_room", roomID); // cleanup on unmount
    };
  }, [currentUser, selectedUser, selectedMessages]);

  /**
   * @Type Socket
   * @Desc Fetch previous messages + listen for incoming messages "receiveMessage"
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

    socket.on("receiveMessage", async (msg) => {
      console.log("[Incoming Message]: ", msg);
      setMessage((prev) => [...prev, msg]);
      await db.messages.clear();
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, selectedUser, selectedMessages]);

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

  /**
   * @Type Socket
   * @Desc typing detection "activity"
   */
  useEffect(() => {
    if (text !== "") {
      socket.emit("activity", { sender: currentUser, receiver: selectedUser });
    }

    return () => {
      socket.off("activity");
    };
  }, [text]);

  /**
   * @Type Socket
   * @Desc typing detection "activityDetected"
   */
  useEffect(() => {
    socket.on("activityDetected", (det) => {
      setIsTyping(det);
      console.log("[set-detection]", det);
      setTimeout(()=> {
      setIsTyping("");
    },2000)
    });

    setTimeout(()=> {
      setIsTyping("");
    },2000)

    return () => {
      socket.off("activityDetected");
    };
  }, [text]);

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
  const handleSend = async (value) => {
    if (!value.trim()) return;

    const newMessage = {
      chat: chatID,
      sender: currentUser,
      receiver: selectedUser,
      message: value,
      date: Date.now(),
      status: "Clock",
    };

    if (!socket.connected) {
      // Save message to Dexie
      await db.messages.add(newMessage);

      // Fetch all messages
      let allMessages = await db.messages.toArray();
      console.log("[All Dexie Messages]", allMessages);

      setMessage((prev) => [...prev, newMessage]);
    }

    const data = {
      chat: chatID,
      sender: currentUser,
      receiver: selectedUser,
      message: value,
      date: Date.now(),
      status: "Single_Tick",
    };

    // Remove newMessage from state
    // setMessage((prev) => prev.filter((msg) => msg.date !== newMessage.date));

    socket.emit("sendMessage", data);
    setText("");
  };

  return (
    <div className="Messenger">
      <div className="chatbox-container">
        {/* ---------------- Header ---------------- */}
        <ChatHeader
          receiver={receiver}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleMenu={handleMenu}
          handleDeleteChat={handleDeleteChat}
          setDeleteOptions={setDeleteOptions}
          selectedUser={selectedUser}
        />

        {/* ---------------- Delete Options ---------------- */}
        {deleteOptions && selectedMessages.length > 0 && (
          <DeleteOptions
            message={message}
            selectedMessages={selectedMessages}
            currentUser={currentUser}
            handleDeleteForMe={handleDeleteForMe}
            handleDeleteForAll={handleDeleteForAll}
          />
        )}

        {/* ---------------- Messages Area ---------------- */}
        <MessageList
          message={message}
          currentUser={currentUser}
          selectionMode={selectionMode}
          selectedMessages={selectedMessages}
          toggleSelectMessage={toggleSelectMessage}
        />

        {/* ---------------- Input Area ---------------- */}
        {selectedUser && (
          <ChatInput text={text} setText={setText} handleSend={handleSend} isTyping={isTyping}/>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
