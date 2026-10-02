import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer;

// Setup WebSocket server
export const setupWebSocket = (server: Server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket) => {
    console.log("WebSocket client connected");

    // Send message when client connects
    socket.send(
      JSON.stringify({
        type: "connection",
        message: "Connected to WebSocket server",
      }),
    );

    // Listen for client messages
    socket.on("message", (data) => {
      console.log(
        "WebSocket message received:",
        data.toString(),
      );
    });

    // Client disconnected
    socket.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    // WebSocket error
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
};

// Send a message to all connected clients
export const broadcastMessage = (
  data: object,
) => {
  if (!wss) {
    return;
  }

  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};