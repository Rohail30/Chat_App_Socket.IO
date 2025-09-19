import MessageItem from "./MessageItem";
import { useEffect, useRef } from "react";

function MessageList({ message, currentUser, selectionMode, selectedMessages, toggleSelectMessage}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [message]);

  return (
    <div className="chatbox-messages" style={{ overflowY: "auto", maxHeight: "400px" }}>
      {message.length > 0 ? (
        <>
          {message.map((msg) => (
            <MessageItem
              key={msg._id || msg.date} // fallback key if no _id
              msg={msg}
              currentUser={currentUser}
              selectionMode={selectionMode}
              selectedMessages={selectedMessages}
              toggleSelectMessage={toggleSelectMessage}
            />
          ))}

          {/* 👇 invisible div for autoscroll */}
          <div ref={bottomRef} />
        </>
      ) : (
        <p className="empty-text">No messages yet. Start chatting 👇</p>
      )}
    </div>
  );
}

export default MessageList;
