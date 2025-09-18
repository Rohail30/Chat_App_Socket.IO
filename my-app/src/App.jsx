import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import Welcome from "./pages/Welcome/Welcome.jsx";
import DexiePractice from "./pages/DexieJS/DexiePractice.js";



function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:user1" element={<Chat />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/chat/:user1/:user2" element={<Chat />} />
        <Route path="/dexie" element={<DexiePractice />} />
      </Routes>
    </div>
  );
}

export default App;
