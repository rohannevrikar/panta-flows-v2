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
  file_ids?: string[];  // Keep this for frontend state management
  isThinking?: boolean;
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
  title?: string;
  workflowTitle?: string;
  workflowId?: string;
  userId?: string;
  created_at: Date;
  createdAt?: string;
  workflow_id?: string;
  isFavorite?: boolean;
  messages: ChatMessage[];
  updatedAt?: string;
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

export interface Workflow {
  id: string;
  title: string;
  description: string;
  system_prompt: string;
  icon_name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  conversation_starters: { id: string; text: string }[];
  is_default: boolean;
}

interface WorkflowConfig {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  color: string;
  conversation_starters: Array<{
    id: string;
    text: string;
  }>;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'http://localhost:8000';
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async getWorkflows(userId: string): Promise<Workflow[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.workflows.list}?user_id=${userId}`, {
        headers: API_HEADERS,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get workflows:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting workflows:', error);
      throw error;
    }
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sessions}/default-user?limit=100&sort=created_at:desc`, {
        method: 'GET',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }

      const data = await response.json();
      return data.map((session: any) => ({
        ...session,
        created_at: new Date(session.created_at)
      }));
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      console.log('Fetching messages for session:', sessionId);
      const response = await fetch(`${this.baseUrl}/api/cosmos/sessions/${sessionId}/messages`, {
        headers: API_HEADERS
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const messages = await response.json();
      console.log('Fetched messages:', messages);
      return messages;
    } catch (error) {
      console.error('Error fetching session messages:', error);
      return [];
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json'
    };
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

  public async createSession(session: Omit<ChatSession, 'id' | 'created_at'>): Promise<ChatSession> {
    try {
      const sessionData = {
        ...session,
        workflowTitle: session.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sessions}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create session:', errorText);
        throw new Error(`Failed to create session: ${errorText}`);
      }

      const data = await response.json();
      return {
        ...data,
        created_at: new Date(data.createdAt)
      };
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
      const messageData = {
        ...message,
        timestamp: new Date().toISOString(),
        userId: userId
      };
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.messages(sessionId, userId)}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to add message');
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

  async sendMessage(data: { sessionId: string; userId: string; message: string; fileIds: string[]; systemPrompt?: string }): Promise<{ content: string }> {
    try {
      console.log('Sending message with data:', JSON.stringify(data, null, 2));
      
      // First, save the user message to the database
      const userMessage = await this.addMessage(data.sessionId, data.userId, {
        role: 'user',
        content: data.message,
        file_ids: data.fileIds || []
      });
      console.log('User message saved:', userMessage);

      // Get AI response
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.chat}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          messages: [
            ...(data.systemPrompt ? [{
              role: 'system',
              content: data.systemPrompt
            }] : []),
            {
              role: 'user',
              content: data.message
            }
          ],
          file_ids: data.fileIds || []
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Message sending failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Message response:', JSON.stringify(responseData, null, 2));
      
      // Save the AI response to the database
      const assistantMessage = await this.addMessage(data.sessionId, data.userId, {
        role: 'assistant',
        content: responseData.choices[0].message.content,
        file_ids: data.fileIds || []
      });
      console.log('Assistant message saved:', assistantMessage);
      
      return { content: responseData.choices[0].message.content };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async createWorkflow(workflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.workflows.create}`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Workflow creation failed:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  public async getWorkflow(workflowId: string, userId: string): Promise<Workflow> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.workflows.get(workflowId)}?user_id=${userId}`, {
        headers: API_HEADERS,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get workflow:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting workflow:', error);
      throw error;
    }
  }

  public async updateWorkflow(workflowId: string, workflowData: Partial<Workflow>, userId: string): Promise<Workflow> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.workflows.update(workflowId)}?user_id=${userId}`, {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update workflow:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  public async deleteWorkflow(workflowId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.workflows.delete(workflowId)}?user_id=${userId}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete workflow:', errorText);
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async getWorkflowConfig(workflowId: string): Promise<WorkflowConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/api/configs/${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow config:', error);
      throw error;
    }
  }

  async getWorkflowConfigs(): Promise<WorkflowConfig[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/configs`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow configurations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow configs:', error);
      throw error;
    }
  }

  async createWorkflowConfig(config: Omit<WorkflowConfig, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/api/configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error('Failed to create workflow configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating workflow config:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sessions}/${sessionId}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance(); 