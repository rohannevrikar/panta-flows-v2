import { useState, useCallback } from 'react';
import { apiService, ChatMessage } from '@/lib/api-service';

interface UseAzureChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useWebSearch?: boolean;
}

export function useAzureChat(options: UseAzureChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (content: string, newFileIds?: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update file IDs if new ones are provided
      if (newFileIds && newFileIds.length > 0) {
        console.log("Adding new file IDs:", newFileIds);
        setFileIds(prev => {
          const updated = [...new Set([...prev, ...newFileIds])];
          console.log("Updated file IDs:", updated);
          return updated;
        });
      }

      // Add user message to the conversation
      const userMessage: ChatMessage = {
        role: 'user',
        content
      };
      
      setMessages(prev => [...prev, userMessage]);

      console.log("Current file IDs:", fileIds);
      console.log("Sending request with file IDs:", fileIds);

      // Create chat completion request
      const response = await apiService.createChatCompletion({
        messages: [
          ...messages,
          userMessage
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800,
        use_web_search: options.useWebSearch || false,
        file_ids: fileIds
      });

      // Add assistant response to the conversation
      const assistantMessage = response.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);

      return assistantMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      console.error('Error in useAzureChat:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages, fileIds, options.temperature, options.maxTokens, options.useWebSearch]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setFileIds([]);
  }, []);

  return {
    messages,
    fileIds,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
} 