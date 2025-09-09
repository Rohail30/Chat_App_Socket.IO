import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import ChatBox from "./pages/ChatBox/ChatBox.jsx";


function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat/:user1" element={<Chat />} />
      <Route path="/chat/:user1/:user2" element={<ChatBox />} />
    </Routes>
    </div>
  );
}

export default App;
