import { CosmosClient, Database, Container } from '@azure/cosmos';
import { COSMOS_CONFIG } from './cosmos-config';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowId: string;
  workflowTitle: string;
  userId: string;
}

export interface ChatSession {
  id: string;
  workflowId: string;
  workflowTitle: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

class CosmosDBService {
  private static instance: CosmosDBService;
  private client: CosmosClient;
  private database: Database | null = null;
  private container: Container | null = null;

  private constructor() {
    this.client = new CosmosClient({
      endpoint: COSMOS_CONFIG.endpoint,
      key: COSMOS_CONFIG.key
    });
  }

  public static getInstance(): CosmosDBService {
    if (!CosmosDBService.instance) {
      CosmosDBService.instance = new CosmosDBService();
    }
    return CosmosDBService.instance;
  }

  private async ensureDatabaseAndContainer() {
    if (!this.database) {
      // Create database if it doesn't exist
      const { database } = await this.client.databases.createIfNotExists({
        id: COSMOS_CONFIG.databaseId
      });
      this.database = database;
    }

    if (!this.container) {
      // Create container if it doesn't exist
      const { container } = await this.database.containers.createIfNotExists({
        id: COSMOS_CONFIG.containerId,
        partitionKey: { paths: ['/userId'] }
      });
      this.container = container;
    }
  }

  public async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    await this.ensureDatabaseAndContainer();
    
    const messageWithId = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };

    const { resource } = await this.container.items.create(messageWithId);
    return resource as ChatMessage;
  }

  public async getChatHistory(userId: string, limit: number = 20): Promise<ChatSession[]> {
    await this.ensureDatabaseAndContainer();
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC OFFSET 0 LIMIT @limit',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    };

    const { resources } = await this.container.items.query(querySpec).fetchAll();
    return resources as ChatSession[];
  }

  public async getChatSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    await this.ensureDatabaseAndContainer();
    
    try {
      const { resource } = await this.container.item(sessionId, userId).read();
      return resource as ChatSession;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      return null;
    }
  }

  public async createChatSession(workflowId: string, workflowTitle: string, userId: string): Promise<ChatSession> {
    await this.ensureDatabaseAndContainer();
    
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      workflowId,
      workflowTitle,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    const { resource } = await this.container.items.create(session);
    return resource as ChatSession;
  }

  public async addMessageToSession(sessionId: string, userId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    await this.ensureDatabaseAndContainer();
    
    const messageWithId = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };

    // Get the session
    const session = await this.getChatSession(sessionId, userId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add message to session
    session.messages.push(messageWithId);
    session.updatedAt = new Date();

    // Update the session
    await this.container.item(sessionId, userId).replace(session);

    return messageWithId;
  }
}

export const cosmosService = CosmosDBService.getInstance(); 