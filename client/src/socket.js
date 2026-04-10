import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_URL || "https://devmate-server.onrender.com";

export const socket = io(URL, {
  autoConnect: false,
});
