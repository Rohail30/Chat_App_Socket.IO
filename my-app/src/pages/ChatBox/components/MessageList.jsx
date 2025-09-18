import MessageItem from "./MessageItem";

function MessageList({ messages, currentUser, selectionMode, selectedMessages, toggleSelectMessage }) {
  return (
    <div className="chatbox-messages">
      {messages.length > 0 ? (
        messages.map(msg => (
          <MessageItem
            key={msg._id}
            msg={msg}
            currentUser={currentUser}
            selectionMode={selectionMode}
            selectedMessages={selectedMessages}
            toggleSelectMessage={toggleSelectMessage}
          />
        ))
      ) : (
        <p className="empty-text">No messages yet. Start chatting 👇</p>
      )}
    </div>
  );
}

export default MessageList;
