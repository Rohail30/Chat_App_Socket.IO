import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../config/AuthContext.jsx";
import apiRequest from "../../config/apiRequest.js";
import { Link } from "react-router-dom";
// import { useSocket } from "../../config/socketContext.jsx";

import "./Welcome.css"; // Import CSS

function Welcome() {
  // const socket = useSocket();
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState();

  // console.log("[Socket]: ", socket);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!currentUser) return; // prevent request if no user
        const res = await apiRequest.get(`/api/users/${currentUser}`);
        setUser(res.data);
      } catch (error) {
        console.log("Error in fetching user: ", error);
      }
    };
    fetchUser();
  }, [currentUser]);

  // useEffect(() => {    
  //   socket.emit("WhoIsOnline", { sender: currentUser});

  //   return () => {
  //     socket.off("WhoIsOnline");
  //   };
  // }, []);

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">
          Welcome {user?.username || "Guest"} 🎉
        </h1>
        <p className="welcome-subtitle">
          You are successfully logged in. Enjoy chatting!
        </p>

        <div className="button-group">
          <Link to="/login" className="btn btn-red">
            Back to Login
          </Link>
          <Link to="/dexie" className="btn btn-red">
            Dexie
          </Link>
          {/* Only show when user exists */}
          {user && (
            <Link to={`/chat/${currentUser}`} className="btn btn-indigo">
              Go to Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Welcome;
