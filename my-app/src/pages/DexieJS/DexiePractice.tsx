import { useState } from "react";
import { db, Message } from "../../db/db.ts";
import { useLiveQuery } from "dexie-react-hooks";

function DexiePractice() {
  const [text, setText] = useState("");

  // Get all messages from IndexedDB (live updating)
  const messages = useLiveQuery(() => db.messages.toArray(), []);

  const handleAdd = async () => {
    if (!text.trim()) return;

    const newMessage: Message = {
      chat: "testChat",
      sender: "me",
      receiver: "friend",
      message: text,
      date: Date.now(),
      status: "Clock",
    };

    await db.messages.add(newMessage);
    setText("");
  };

  const markAsSent = async (id: number) => {
    await db.messages.update(id, { status: "Sent" });
  };

  const deleteMessage = async (id: number) => {
    await db.messages.delete(id);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Dexie.js Practice</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: "5px" }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
        {messages?.map((msg) => (
          <li
            key={msg.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{msg.message}</strong> <br />
              <small>Status: {msg.status}</small>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              {msg.status === "Clock" && (
                <button onClick={() => markAsSent(msg.id!)}>Mark Sent ✅</button>
              )}
              <button onClick={() => deleteMessage(msg.id!)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DexiePractice;
