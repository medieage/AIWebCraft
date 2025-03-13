import { 
  users, type User, type InsertUser,
  apiKeys, type ApiKey, type InsertApiKey,
  chatMessages, type ChatMessage, type InsertChatMessage,
  generatedCode, type GeneratedCode, type InsertGeneratedCode
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getApiKey(userId: number, provider: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey>;
  
  getChatMessages(userId: number, sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getGeneratedCode(userId: number, sessionId: string): Promise<GeneratedCode[]>;
  createGeneratedCode(code: InsertGeneratedCode): Promise<GeneratedCode>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<number, ApiKey>;
  private chatMessages: Map<string, ChatMessage>;
  private generatedCodes: Map<string, GeneratedCode>;
  
  private currentUserId: number;
  private currentApiKeyId: number;
  private currentChatMessageId: number;
  private currentGeneratedCodeId: number;

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.chatMessages = new Map();
    this.generatedCodes = new Map();
    
    this.currentUserId = 1;
    this.currentApiKeyId = 1;
    this.currentChatMessageId = 1;
    this.currentGeneratedCodeId = 1;
    
    // Add a default user
    this.createUser({
      username: "default",
      password: "password",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getApiKey(userId: number, provider: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(
      (apiKey) => apiKey.userId === userId && apiKey.provider === provider && apiKey.active,
    );
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentApiKeyId++;
    const apiKey: ApiKey = { ...insertApiKey, id, active: true };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
  
  async updateApiKey(id: number, updatedFields: Partial<InsertApiKey>): Promise<ApiKey> {
    const existingApiKey = this.apiKeys.get(id);
    if (!existingApiKey) {
      throw new Error(`API key with ID ${id} not found`);
    }
    
    const updatedApiKey: ApiKey = { ...existingApiKey, ...updatedFields };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }
  
  async getChatMessages(userId: number, sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.userId === userId && message.sessionId === sessionId,
    );
  }
  
  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const chatMessage: ChatMessage = { ...insertChatMessage, id };
    this.chatMessages.set(id.toString(), chatMessage);
    return chatMessage;
  }
  
  async getGeneratedCode(userId: number, sessionId: string): Promise<GeneratedCode[]> {
    return Array.from(this.generatedCodes.values()).filter(
      (code) => code.userId === userId && code.sessionId === sessionId,
    );
  }
  
  async createGeneratedCode(insertGeneratedCode: InsertGeneratedCode): Promise<GeneratedCode> {
    const id = this.currentGeneratedCodeId++;
    const generatedCode: GeneratedCode = { ...insertGeneratedCode, id };
    this.generatedCodes.set(id.toString(), generatedCode);
    return generatedCode;
  }
}

export const storage = new MemStorage();
