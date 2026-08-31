import { io, Socket } from "socket.io-client";
import { tabSession } from "@/utils/tabSession";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "")
  : "http://localhost:3000";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

let connectionListeners: Array<(status: ConnectionStatus) => void> = [];
let lastStatus: ConnectionStatus = "disconnected";

export function onConnectionStatusChange(listener: (status: ConnectionStatus) => void) {
  listener(lastStatus);
  connectionListeners.push(listener);
  return () => {
    connectionListeners = connectionListeners.filter((l) => l !== listener);
  };
}

function notifyStatus(status: ConnectionStatus) {
  lastStatus = status;
  connectionListeners.forEach((l) => l(status));
}

let currentToken: string | null = null;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  auth: (cb: (data: { token?: string }) => void) => {
    cb({ token: currentToken || undefined });
  },
});

function doAuthenticate() {
  if (currentToken) {
    socket.emit("authenticate", { token: currentToken });
  }
}

socket.on("connect", () => {
  notifyStatus("connected");
  doAuthenticate();
});

socket.on("reconnect_attempt", () => {
  notifyStatus("reconnecting");
});

socket.on("disconnect", (reason) => {
  if (reason === "io client disconnect" || reason === "io server disconnect") {
    notifyStatus("disconnected");
  } else {
    notifyStatus("reconnecting");
  }
});

socket.on("connect_error", () => {
  notifyStatus("reconnecting");
});

socket.on("authenticated", (data: { success: boolean; error?: string }) => {
  if (!data.success) {
    notifyStatus("disconnected");
  }
});

export const connectSocket = (token: string) => {
  currentToken = token;
  if (socket.connected) {
    notifyStatus("connected");
    doAuthenticate();
    return;
  }
  notifyStatus("reconnecting");
  socket.connect();
};

export const disconnectSocket = () => {
  currentToken = null;
  if (socket.connected) {
    socket.disconnect();
  }
};

export const updateSocketToken = (token: string) => {
  currentToken = token;
  if (socket.connected) {
    socket.emit("authenticate", { token });
  }
};
