function ChatInput({ text, setText, handleSend }) {
  return (
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
  );
}

export default ChatInput;
