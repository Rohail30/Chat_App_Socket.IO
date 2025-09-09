import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
// import Chat from "./pages/Chat.jsx";

function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/chat" element={<Chat />} /> */}
    </Routes>
    </div>
  );
}

export default App;
