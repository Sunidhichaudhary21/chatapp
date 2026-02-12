import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, or, and, asc, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;
  getMessages(user1Id: number, user2Id: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await db.insert(users).values(insertUser);
    const user = await this.getUserByUsername(insertUser.username);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async createMessage(message: InsertMessage & { senderId: number }): Promise<Message> {
    await db.insert(messages).values(message);
    // Get the most recently created message
    const [newMessage] = await db.select()
      .from(messages)
      .orderBy(desc(messages.id))
      .limit(1);
    if (!newMessage) throw new Error("Failed to create message");
    return newMessage;
  }

  async getMessages(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(asc(messages.createdAt));
  }
}

export const storage = new DatabaseStorage();
