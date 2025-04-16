import * as React from 'react';
import { apiService, ChatSession, ChatMessage } from '../lib/api-service';

interface UseChatHistoryProps {
  userId?: string;
  workflowId?: string;
  workflowTitle?: string;
  sessionId?: string;
  systemPrompt?: string;
}

export const useChatHistory = ({
  userId = "default-user",
  workflowId = "default-workflow",
  workflowTitle = "Chat Assistant",
  sessionId,
  systemPrompt
}: UseChatHistoryProps) => {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = React.useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load sessions for the user and workflow
  React.useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const userSessions = await apiService.getChatHistory(userId);
        const workflowSessions = userSessions.filter(session => session.workflowId === workflowId);
        setSessions(workflowSessions);
        
        // If a sessionId is provided, load that session
        if (sessionId) {
          const session = await apiService.getSession(sessionId, userId);
          if (session) {
            setCurrentSession(session);
          } else {
            // If session not found, create a new one
            const newSession = await createSession();
            if (newSession) {
              setCurrentSession(newSession);
            }
          }
        } else if (workflowSessions.length > 0) {
          // If no sessionId but we have sessions, use the most recent one
          const mostRecentSession = workflowSessions.reduce((prev, current) => 
            new Date(current.createdAt) > new Date(prev.createdAt) ? current : prev
          );
          setCurrentSession(mostRecentSession);
        } else {
          // If no sessions exist, create a new one
          const newSession = await createSession();
          if (newSession) {
            setCurrentSession(newSession);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [userId, workflowId, sessionId]);

  const createSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await apiService.createSession({
        userId,
        workflowId,
        workflowTitle,
        messages: systemPrompt ? [{
          role: 'system',
          content: systemPrompt
        }] : []
      });
      
      setSessions(prev => [...prev, newSession]);
      setCurrentSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = async (message: Omit<ChatMessage, 'id'>) => {
    if (!currentSession) return null;
    
    try {
      setIsLoading(true);
      const updatedMessage = await apiService.addMessage(
        currentSession.id,
        userId,
        message
      );
      
      // Update current session with new message
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, updatedMessage],
          updatedAt: new Date().toISOString()
        };
      });
      
      return updatedMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = await apiService.getSession(sessionId, userId);
      if (session) {
        setCurrentSession(session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    sessions, 
    currentSession, 
    isLoading, 
    error,
    createSession,
    addMessage,
    loadSession
  };
}; 