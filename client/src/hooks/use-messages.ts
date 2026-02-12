import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMessage } from "@shared/routes";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";

// Real-time hook for Socket.io
export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to same host
    const socket = io(window.location.protocol + "//" + window.location.host);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("join", user.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
}

export function useMessages(userId?: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const socket = useSocket();

  // Fetch initial history
  const query = useQuery({
    queryKey: [api.messages.list.path, userId],
    queryFn: async () => {
      if (!userId) return [];
      const url = buildUrl(api.messages.list.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !userId) return;

    const handleMessage = (message: any) => {
      // Only handle messages for the currently open chat
      if (
        (message.senderId === userId && message.receiverId === user?.id) ||
        (message.senderId === user?.id && message.receiverId === userId)
      ) {
        queryClient.setQueryData(
          [api.messages.list.path, userId],
          (old: any[] | undefined) => [...(old || []), message]
        );
      }
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket, userId, queryClient, user]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (newMessage) => {
      // Optimistically update the UI immediately
      if (socket) {
        socket.emit("message", newMessage);
      }
      
      // Update local cache for the receiver
      queryClient.setQueryData(
        [api.messages.list.path, newMessage.receiverId],
        (old: any[] | undefined) => [...(old || []), newMessage]
      );
    },
  });
}
