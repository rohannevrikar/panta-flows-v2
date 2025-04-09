import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, X, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Logo from "./Logo";
import ProfileDropdown from "./ProfileDropdown";
import SearchChat from "./SearchChat";
import { useAzureChat } from "@/hooks/use-azure-chat";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useFiles } from "@/hooks/use-files";
import { ChatMessage } from "@/lib/api-service";
import { useWebSearch } from '@/hooks/use-web-search';
import { apiService } from "@/lib/api-service";

interface UIMessage extends ChatMessage {
  id: string;
  timestamp: string;
  isError?: boolean;
  sender: "user" | "bot";
}

interface ConversationStarter {
  id: string;
  text: string;
}

interface ChatInterfaceProps {
  onClose?: () => void;
  workflowTitle?: string;
  workflowId?: string;
  userName?: string;
  userId?: string;
  sessionId?: string;
  conversationStarters?: ConversationStarter[];
  systemPrompt?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: {
    id: string;
    content_type: string;
    size: number;
  }[];
  file_references?: string[];
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

interface SearchChatProps {
  autoFocus?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (text: string, files: File[]) => void;
  disableNavigation?: boolean;
}

const ChatInterface = ({ 
  onClose, 
  workflowTitle = "Chat Assistant",
  workflowId = "default-workflow",
  userName = "Moin Arian",
  userId = "default-user",
  sessionId: propSessionId,
  conversationStarters = [],
  systemPrompt
}: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const urlWorkflowId = searchParams.get('workflowId');
  const urlQuery = searchParams.get('query');
  
  // Use session ID from props or URL
  const effectiveSessionId = propSessionId || urlSessionId;
  
  // Use workflow ID from props or URL
  const effectiveWorkflowId = workflowId || urlWorkflowId || "default-workflow";
  
  // Set initial input text if query is provided
  useEffect(() => {
    if (urlQuery) {
      setInputText(urlQuery);
    }
  }, [urlQuery]);
  
  // Default conversation starters if none are provided
  const defaultStarters = [
    { id: "1", text: "Generate a marketing strategy for my business" },
    { id: "2", text: "Help me draft an email to a client" },
    { id: "3", text: "Summarize this article for me" },
    { id: "4", text: "Create a to-do list for my project" }
  ];
  
  // Use provided conversation starters or fall back to defaults
  const effectiveStarters = conversationStarters.length > 0 
    ? conversationStarters 
    : defaultStarters;
  
  const [inputText, setInputText] = useState('');
  const [showStarters, setShowStarters] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize chat history
  const { 
    currentSession, 
    sessions,
    isLoading: historyLoading, 
    error: historyError,
    createSession,
    addMessage,
    loadSession
  } = useChatHistory({
    userId,
    workflowId: effectiveWorkflowId,
    workflowTitle,
    sessionId: effectiveSessionId
  });

  // Create a new session if none exists and update URL
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSession) {
        // Always create a new session if no sessionId is provided
        const newSession = await createSession();
        if (newSession) {
          // Update URL with session ID if not already in a session
          if (!effectiveSessionId) {
            navigate(`/chat?sessionId=${newSession.id}`, { replace: true });
          }
        }
      }
    };
    initializeSession();
  }, [currentSession, effectiveSessionId, createSession, setSearchParams, navigate]);

  // Load messages from current session
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages);
    }
  }, [currentSession]);
  
  // Load specific session if sessionId is provided
  useEffect(() => {
    if (effectiveSessionId) {
      loadSession(effectiveSessionId);
    }
  }, [effectiveSessionId, loadSession]);
  
  // Azure OpenAI chat hook with web search enabled
  const { 
    messages: azureMessages, 
    isLoading: azureLoading, 
    error: azureError, 
    sendMessage 
  } = useAzureChat({
    systemPrompt: systemPrompt || "You are a helpful AI assistant with access to web search and file search capabilities. IMPORTANT: When files are provided in the request, you MUST use the file_search tool to search through those files before responding. After searching through files, analyze the results thoroughly and provide a comprehensive summary of the information found. Extract and present the most relevant facts, figures, and details from the files. Use web search when you need current information or need to verify facts that aren't in the provided files.",
    temperature: 0.7,
    maxTokens: 800
  });

  // Convert Azure messages to UI messages
  const uiMessages: UIMessage[] = azureMessages.map((msg, index) => ({
    ...msg,
    id: `${msg.role}-${Date.now()}-${index}`,
    timestamp: new Date().toISOString(),
    sender: msg.role === 'user' ? 'user' : 'bot'
  }));

  // Initialize file search
  const { 
    searchFiles,
    searchResults,
    isLoading: fileSearchLoading,
    error: fileSearchError,
    uploadFile
  } = useFiles();

  // Initialize web search
  const { 
    search: webSearch,
    results: webSearchResults,
    isLoading: webSearchLoading,
    error: webSearchError
  } = useWebSearch({
    maxResults: 5,
    refineResults: true
  });

  const handleClose = () => {
    // Navigate back to the dashboard and replace the current history entry
    navigate('/dashboard', { replace: true });
  };
  
  const handleStarterClick = async (text: string) => {
    setInputText(text);
    setShowStarters(false);
    try {
      // Send message to Azure OpenAI
      const response = await sendMessage(text);
      
      // Save user message to history
      if (currentSession) {
        await addMessage({
          role: 'user',
          content: text
        });
        
        // Save assistant response to history
        if (response) {
          await addMessage({
            role: 'assistant',
            content: response.content
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = async (text: string, files: File[]) => {
    if (!text.trim() && files.length === 0) return;
  
    try {
      setIsLoading(true);
      setError(null);
  
      // Create user message with uploaded files
      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        files: files.map(file => ({
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          content_type: file.type,
          size: file.size
        }))
      };
  
      // Upload files and get their IDs
      const fileUploadPromises = files.map(async (file) => {
        const response = await apiService.uploadFile(file);
        return response.id;
      });
  
      const uploadedFileIds = await Promise.all(fileUploadPromises);
      console.log("Uploaded file IDs:", uploadedFileIds);
  
      // Send message with file IDs
      const message = text + (files.length > 0 ? `\n\nI've uploaded ${files.length} file(s).` : '');
      const response = await sendMessage(message, uploadedFileIds);
  
      // Save user message to history
      if (currentSession) {
        await addMessage({
          role: 'user',
          content: text,
          files: userMessage.files
        });
        
        // Save assistant response to history
        if (response) {
          await addMessage({
            role: 'assistant',
            content: response.content
          });
        }
      }
  
      // Add messages to chat UI
      setMessages(prev => [...prev, userMessage, response]);
  
      // Clear input and uploaded files
      setInputText('');
      setUploadedFiles([]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm z-10 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="text-xl font-medium panta-gradient-text">
            {workflowTitle}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-lg font-medium">{userName}</div>
            <ProfileDropdown 
              name={userName} 
              email="moin@example.com"
            />
          </div>
        </div>
      </header>
      
      {/* Chat Interface without Sidebar */}
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-gray-50 relative">
        <div className="flex-1 flex flex-col relative">
          <ScrollArea className="flex-1 p-4 pt-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {showStarters && uiMessages.length === 0 && (
                <div className="mb-8 flex flex-col items-center justify-center pt-12">
                  <h2 className="text-2xl font-semibold mb-6 text-center">{workflowTitle}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {effectiveStarters.map((starter) => (
                      <Button
                        key={starter.id}
                        variant="outline"
                        className="text-left h-auto py-3 px-4 whitespace-normal hover:bg-black hover:text-white hover:border-black"
                        onClick={() => handleStarterClick(starter.text)}
                      >
                        {starter.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-panta-blue"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Feather className="h-5 w-5 text-panta-blue" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-panta-blue text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs text-gray-500 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4 bg-white">
            <SearchChat 
              autoFocus={true} 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onSubmit={handleSubmit}
              disableNavigation={true}
            />
            <div className="text-xs text-center mt-3 text-gray-500">
              PANTA Flows can make mistakes. Please check important information.
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="rounded-full hover:bg-black hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
