import { RiCheckFill } from "react-icons/ri";
import { PiChecks } from "react-icons/pi";
import { CiClock1 } from "react-icons/ci";

function MessageItem({ msg, currentUser, selectionMode, selectedMessages, toggleSelectMessage }) {
  return (
    <div
      className={`message-wrapper ${msg.sender === currentUser ? "sent" : "received"}`}
      onClick={() => selectionMode && toggleSelectMessage(msg._id)}
      style={{
        background: selectedMessages.includes(msg._id) ? "#444" : "transparent",
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
            background: msg.sender === currentUser ? "#C4EFC4" : "#e5e7eb",
            color: msg.sender === currentUser ? "white" : "black",
          }}
        >
          <p>
            {msg.deletedForMe && msg.sender === currentUser
              ? "This message was deleted"
              : msg.message}
          </p>

          {/* ✅ Status Ticks */}
          <span className="status">
            {msg.status === "Clock" && <CiClock1 />}
            {msg.status === "Single_Tick" && <RiCheckFill />}
            {msg.status === "Double_Tick" && <PiChecks />}
            {msg.status === "Blue_Tick" && <PiChecks color="blue" />}
          </span>

          <span className="time">
            {new Date(msg.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageItem;
