export interface Workflow {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  conversationStarters: string[];
}

export interface ChatSession {
  id: string;
  workflowId: string;
  title: string;
  workflowTitle: string;
  userId: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface WorkflowFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  conversationStarters: string[];
} 