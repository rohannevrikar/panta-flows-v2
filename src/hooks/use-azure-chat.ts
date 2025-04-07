import { useState, useCallback } from 'react';
import { AzureOpenAIService, ChatMessage, ChatCompletionRequest } from '@/lib/azure-openai';

interface UseAzureChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
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
      };

      // Get response from Azure OpenAI
      const azureService = AzureOpenAIService.getInstance();
      const response = await azureService.createChatCompletion(request);

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
  }, [messages, options.systemPrompt, options.temperature, options.maxTokens]);

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