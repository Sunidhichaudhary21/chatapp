import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { Server as SocketIOServer } from "socket.io";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // Users
  app.get("/api/users/search/:username", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Messages
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user1Id = (req.user as any).id;
    const user2Id = parseInt(req.params.userId);
    const messages = await storage.getMessages(user1Id, user2Id);
    res.json(messages);
  });

  // Socket.io
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connection");

    socket.on("join", (userId) => {
      socket.join(userId.toString());
      console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on("message", async (data) => {
      // data: { senderId, receiverId, content }
      // We also save to DB via API, but if the client emits this for real-time:
      // Ideally, the client calls the POST API, and the SERVER emits the socket event.
      // Let's implement that pattern: API -> Socket emit.
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...data,
        senderId: (req.user as any).id,
      });

      // Only emit to receiver (sender adds it via API response)
      io.to(message.receiverId.toString()).emit("message", message);

      res.status(201).json(message);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  return httpServer;
}
