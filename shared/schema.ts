import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(),
  key: text("key").notNull(),
  model: text("model"),
  active: boolean("active").default(true),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const generatedCode = pgTable("generated_code", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  provider: true,
  key: true,
  model: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  sessionId: true,
  role: true,
  content: true,
  timestamp: true,
});

export const insertGeneratedCodeSchema = createInsertSchema(generatedCode).pick({
  userId: true,
  sessionId: true,
  language: true,
  code: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertGeneratedCode = z.infer<typeof insertGeneratedCodeSchema>;

export type User = typeof users.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GeneratedCode = typeof generatedCode.$inferSelect;

export type MessageRole = "system" | "user" | "assistant";

export const providerSchema = z.object({
  provider: z.string(),
  apiKey: z.string(),
  model: z.string().optional(),
});

export type ProviderConfig = z.infer<typeof providerSchema>;
