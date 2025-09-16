// // socketContext.jsx
// import { createContext, useContext } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// // create socket instance (don't connect yet)
// const socket = io("http://localhost:3000", {
//   withCredentials: true,
//   autoConnect: false, // ❌ prevent immediate connection
// });

// export const SocketProvider = ({ children }) => {
//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);



import { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext.jsx";

const SocketContext = createContext(null);

// create socket instance (but don’t auto-connect)
const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export const SocketProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      // attach auth info
      socket.auth = { userId: currentUser };
      socket.connect();
      console.log("🔌 Socket connected as user:", currentUser);
    }
    // no disconnect yet, since logout is not implemented
//     if (!currentUser && socket.connected) {
//   socket.disconnect();
// }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
