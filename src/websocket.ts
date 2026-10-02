import type { Server } from "http";
import type { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  role: string;
}

// Store connected users
const clients = new Map<number, Set<WebSocket>>();

// Get token from WebSocket URL
const getTokenFromRequest = (request: IncomingMessage): string | null => {
  if (!request.url) {
    return null;
  }

  const url = new URL(request.url, "http://localhost");

  return url.searchParams.get("token");
};

// Setup WebSocket server
export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    try {
      const token = getTokenFromRequest(request);

      if (!token) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Authentication token is required",
          }),
        );

        socket.close();
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error("JWT_SECRET is not configured");

        socket.send(
          JSON.stringify({
            type: "error",
            message: "Server configuration error",
          }),
        );

        socket.close();
        return;
      }

      // Verify JWT
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      const userId = decoded.id;

      // Create a set for the user if one does not exist
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }

      // Add this connection
      clients.get(userId)?.add(socket);

      console.log(`WebSocket connected for user ${userId}`);

      // Confirm connection
      socket.send(
        JSON.stringify({
          type: "connection",
          message: "Connected to WebSocket server",
          user_id: userId,
        }),
      );

      socket.on("message", (data) => {
        console.log(`WebSocket message from user ${userId}:`, data.toString());
      });

      socket.on("close", () => {
        const userSockets = clients.get(userId);

        if (userSockets) {
          userSockets.delete(socket);

          if (userSockets.size === 0) {
            clients.delete(userId);
          }
        }

        console.log(`WebSocket disconnected for user ${userId}`);
      });

      socket.on("error", (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
      });
    } catch (error) {
      console.error("WebSocket authentication failed:", error);

      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid or expired token",
        }),
      );

      socket.close();
    }
  });

  return wss;
};

// Send a live notification to one user
export const sendToUser = (userId: number, data: object) => {
  const userSockets = clients.get(userId);

  if (!userSockets) {
    return;
  }

  const message = JSON.stringify(data);

  userSockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
};
