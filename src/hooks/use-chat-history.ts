import { useState, useEffect, useCallback } from 'react';
import { cosmosService, ChatSession, ChatMessage } from '@/lib/cosmos-service';

interface UseChatHistoryOptions {
  userId: string;
  workflowId?: string;
  workflowTitle?: string;
  sessionId?: string;
}

export function useChatHistory({
  userId,
  workflowId,
  workflowTitle,
  sessionId
}: UseChatHistoryOptions) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await cosmosService.getChatHistory(userId);
      setSessions(history);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chat history'));
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load specific session
  const loadSession = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await cosmosService.getChatSession(id, userId);
      setCurrentSession(session);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load session'));
      console.error('Error loading session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create new session
  const createSession = useCallback(async () => {
    if (!workflowId || !workflowTitle) {
      throw new Error('Workflow ID and title are required to create a session');
    }

    try {
      setIsLoading(true);
      setError(null);
      const session = await cosmosService.createChatSession(workflowId, workflowTitle, userId);
      setCurrentSession(session);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      console.error('Error creating session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, workflowId, workflowTitle]);

  // Add message to session
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'workflowId' | 'workflowTitle' | 'userId'>) => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const fullMessage: Omit<ChatMessage, 'id'> = {
        ...message,
        workflowId: currentSession.workflowId,
        workflowTitle: currentSession.workflowTitle,
        userId
      };
      
      const savedMessage = await cosmosService.addMessageToSession(
        currentSession.id,
        userId,
        fullMessage
      );
      
      // Update current session with new message
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, savedMessage],
          updatedAt: new Date()
        };
      });
      
      return savedMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add message'));
      console.error('Error adding message:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId]);

  // Initialize
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Load specific session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    loadChatHistory,
    loadSession,
    createSession,
    addMessage
  };
} 