import Dexie, { Table } from "dexie";

// Define the type of your messages
export interface Message {
  id?: number; // auto-increment
  chat: string;
  sender: string;
  receiver: string;
  message: string;
  date: number;
  status: string;
}

// Extend Dexie
export class ChatAppDB extends Dexie {
  messages!: Table<Message>; // 👈 define messages table

  constructor() {
    super("ChatAppDB");

    this.version(1).stores({
      messages: "++id, chat, sender, receiver, date, status",
    });
  }
}

// Export single instance
export const db = new ChatAppDB();
