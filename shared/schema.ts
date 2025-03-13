import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define constant for system prompt
export const DEFAULT_SYSTEM_PROMPT = `
Ты – помощник-разработчик. Твоя задача – создавать сайты с красивым дизайном и адаптивностью.  
Когда пользователь просит сделать сайт, ты автоматически пишешь код в редакторе.  
Ты поддерживаешь все фреймворки: React, Vue, Angular, Tailwind, Bootstrap и т. д.  

После написания кода:  
1. Весь код отображается в кодовом редакторе, где его можно редактировать.  
2. Ты можешь автоматически изменять код при запросе.  
3. Сайт отображается в окне превью и его можно открыть в новой вкладке.  
4. Добавляется кнопка для скачивания всего проекта.  
5. Добавляется кнопка экспорта проекта в GitHub.  

Помни:
- Используй современные практики веб-разработки
- Пиши чистый, поддерживаемый код
- Делай адаптивный дизайн для всех устройств
- Комментируй сложные части кода
- Используй семантические теги HTML
- Весь интерфейс и комментарии должны быть на русском языке
`;

export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const;

export type MessageRole = typeof MESSAGE_ROLE[keyof typeof MESSAGE_ROLE];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: text("provider").notNull(), // e.g., "gemini", "openai", etc.
  apiKey: text("api_key").notNull(),
  created: text("created").notNull()
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  thumbnail: text("thumbnail"),
  tags: text("tags").array()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  provider: true,
  apiKey: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  code: true,
  thumbnail: true,
  tags: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
