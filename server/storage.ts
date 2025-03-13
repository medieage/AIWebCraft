import { 
  users, type User, type InsertUser,
  apiKeys, type ApiKey, type InsertApiKey,
  templates, type Template, type InsertTemplate
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Keys
  getApiKey(userId: number, provider: string): Promise<ApiKey | undefined>;
  saveApiKey(userId: number, apiKey: InsertApiKey): Promise<ApiKey>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeysStore: Map<number, ApiKey>;
  private templatesStore: Map<number, Template>;
  currentUserId: number;
  currentApiKeyId: number;
  currentTemplateId: number;

  constructor() {
    this.users = new Map();
    this.apiKeysStore = new Map();
    this.templatesStore = new Map();
    this.currentUserId = 1;
    this.currentApiKeyId = 1;
    this.currentTemplateId = 1;
    
    // Add a default user
    this.createUser({
      username: "demo",
      password: "password"
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
    return Array.from(this.apiKeysStore.values()).find(
      (apiKey) => apiKey.userId === userId && apiKey.provider === provider
    );
  }
  
  async saveApiKey(userId: number, insertApiKey: InsertApiKey): Promise<ApiKey> {
    // Check if an API key for this provider already exists
    const existingKey = await this.getApiKey(userId, insertApiKey.provider);
    
    if (existingKey) {
      // Update existing key
      const updatedKey: ApiKey = { 
        ...existingKey, 
        apiKey: insertApiKey.apiKey,
        created: new Date().toISOString() 
      };
      this.apiKeysStore.set(existingKey.id, updatedKey);
      return updatedKey;
    } else {
      // Create new key
      const id = this.currentApiKeyId++;
      const apiKey: ApiKey = { 
        ...insertApiKey, 
        id, 
        userId, 
        created: new Date().toISOString() 
      };
      this.apiKeysStore.set(id, apiKey);
      return apiKey;
    }
  }
  
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templatesStore.values());
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templatesStore.get(id);
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { ...insertTemplate, id };
    this.templatesStore.set(id, template);
    return template;
  }
}

export const storage = new MemStorage();
