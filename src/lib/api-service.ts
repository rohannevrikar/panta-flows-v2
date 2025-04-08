import { API_CONFIG, API_HEADERS } from './api-config';

export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
  workflowId?: string;
  workflowTitle?: string;
  userId?: string;
  files?: FileInfo[];
  file_references?: string[];
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  use_web_search?: boolean;
  file_ids?: string[];
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatSession {
  id: string;
  workflowId: string;
  workflowTitle: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface FileInfo {
  id: string;
  size: number;
  content_type: string;
  url?: string;
}

export interface SearchRequest {
  query: string;
  file_ids?: string[];
  max_results?: number;
}

export interface SearchResult {
  content: string;
  file_references?: string[];
}

export interface WebSearchRequest {
  query: string;
  max_results?: number;
  refine_results?: boolean;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  source?: string;
  relevance_score?: number;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      console.log('Creating chat completion with request:', JSON.stringify(request, null, 2));
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.chat}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling chat completion API:', error);
      throw error;
    }
  }

  public async createSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
    try {
      // Add required fields that the backend expects
      const sessionData = {
        ...session,
        messages: session.messages || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating session with data:', JSON.stringify(sessionData, null, 2));
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sessions}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session creation failed:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  public async getChatHistory(userId: string, limit: number = 20): Promise<ChatSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sessions}/${userId}?limit=${limit}`, {
        method: 'GET',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  public async getSession(sessionId: string, userId: string): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.session(sessionId, userId)}`, {
        method: 'GET',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  public async addMessage(sessionId: string, userId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    try {
      // Get the session to get workflow info
      const session = await this.getSession(sessionId, userId);
      
      // Add required fields
      const messageData = {
        ...message,
        timestamp: new Date().toISOString(),
        workflowId: session.workflowId,
        workflowTitle: session.workflowTitle,
        userId: userId
      };
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.messages(sessionId, userId)}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // File operations
  public async uploadFile(file: File): Promise<FileInfo> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.files.upload}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);
      return {
        id: result.file_id,
        size: file.size,
        content_type: file.type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  public async listFiles(): Promise<FileInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.files.list}`, {
        method: 'GET',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  public async searchFiles(query: string): Promise<SearchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content || '',
        file_references: data.file_references || []
      };
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  public async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.files.delete(fileId)}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  public async webSearch(request: WebSearchRequest): Promise<WebSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.webSearch}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing web search:', error);
      throw error;
    }
  }

  async sendMessage(content: string): Promise<{ content: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { content: data.content };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance(); 