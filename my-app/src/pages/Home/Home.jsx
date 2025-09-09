import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to the Chat App 🎉</h1>
      <p className="home-subtitle">
        Connect with friends and start chatting instantly!
      </p>
      <Link to="/login" className="home-button">
        Start Chatting Now
      </Link>
    </div>
  );
}

export default Home;
