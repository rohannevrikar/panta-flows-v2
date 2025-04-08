import { useState, useCallback } from 'react';
import { apiService, ChatMessage, ChatCompletionRequest } from '@/lib/api-service';

interface UseAzureChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useWebSearch?: boolean;
}

export function useAzureChat(options: UseAzureChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the conversation
      const userMessage: ChatMessage = { role: 'user' as const, content };
      setMessages(prev => [...prev, userMessage]);

      // Prepare messages for the API call
      const apiMessages: ChatMessage[] = [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        ...messages,
        userMessage
      ];

      // Create the request
      const request: ChatCompletionRequest = {
        messages: apiMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 800,
        use_web_search: options.useWebSearch ?? false
      };

      // Get response from API
      const response = await apiService.createChatCompletion(request);

      // Add assistant's response to the conversation
      const assistantMessage = response.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);

      return assistantMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages, options.systemPrompt, options.temperature, options.maxTokens, options.useWebSearch]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
} 