import { MdOutlineDelete, MdOutlineCancel } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";

function ChatHeader({ receiver, selectionMode, setSelectionMode, menuOpen, setMenuOpen, handleMenu, handleDeleteChat, setDeleteOptions, selectedUser }) {
  return (
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
  );
}

export default ChatHeader;
