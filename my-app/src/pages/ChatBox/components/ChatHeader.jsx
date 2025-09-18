function ChatHeader({ receiver, selectionMode, setSelectionMode, menuOpen, handleMenu, handleDeleteChat }) {
  return (
    <div className="chatbox-header">
      <h2 className="chatbox-title">
        {receiver ? receiver.username : "Start Chatting now"}
      </h2>

      <div className="chatbox-actions">
        {selectionMode ? (
          <>
            <button onClick={handleDeleteChat}>Delete</button>
            <button onClick={() => setSelectionMode(false)}>Cancel</button>
          </>
        ) : (
          receiver && (
            <>
              <button onClick={handleMenu}>⋮</button>
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
  );
}

export default ChatHeader;
