import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, ChatSession, ChatMessage } from '@/lib/api-service';

interface UseChatHistoryOptions {
  userId: string;
  workflowId?: string;
  workflowTitle?: string;
  sessionId?: string;
  systemPrompt?: string;
}

export function useChatHistory({
  userId,
  workflowId,
  workflowTitle,
  sessionId,
  systemPrompt
}: UseChatHistoryOptions) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedSession = useRef<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load chat history and session in a single effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If we have a sessionId, load that specific session first
        if (sessionId) {
          // Skip if we've already loaded this session
          if (hasLoadedSession.current === sessionId) {
            return;
          }

          const session = await apiService.getSession(sessionId, userId);
          if (session) {
            setCurrentSession(session);
            setMessages(session.messages);
            hasLoadedSession.current = sessionId;
            return; // Exit early since we have our specific session
          }
        }

        // If no sessionId or session not found, load all sessions
        const history = await apiService.getChatHistory(userId);
        setSessions(history);

        // If we have a workflowId, filter sessions for that workflow
        if (workflowId) {
          const workflowSessions = history.filter(session => session.workflowId === workflowId);
          if (workflowSessions.length > 0) {
            const mostRecentSession = workflowSessions.reduce((prev, current) => 
              new Date(current.updatedAt) > new Date(prev.updatedAt) ? current : prev
            );
            setCurrentSession(mostRecentSession);
            setMessages(mostRecentSession.messages);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, sessionId, workflowId]);

  // Create a new session
  const createSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newSession = await apiService.createSession({
        userId,
        workflowId,
        workflowTitle,
        messages: [] // Always start with empty messages
      });

      if (newSession) {
        setCurrentSession(newSession);
        setSessions(prev => [...prev, newSession]);
        hasLoadedSession.current = newSession.id;
      }

      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, workflowId, workflowTitle]);

  // Load a specific session by ID
  const loadSession = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await apiService.getSession(id, userId);

      if (session) {
        setCurrentSession(session);
        setSessions(prev => {
          const exists = prev.some(s => s.id === session.id);
          return exists ? prev : [...prev, session];
        });
        hasLoadedSession.current = id;
      }

      return session;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load specific session'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Add message to session
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      setError(null);
      const savedMessage = await apiService.addMessage(currentSession.id, userId, message);
      
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, savedMessage]
        };
      });

      return savedMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add message'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    loadSession,
    createSession,
    addMessage
  };
} 