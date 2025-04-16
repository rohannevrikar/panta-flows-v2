import { useState, useEffect, useRef } from "react";
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
import { ChatMessage, ChatSession } from "@/lib/types";
import { useWebSearch } from '@/hooks/use-web-search';
import { apiService } from "@/lib/api-service";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConversationStarter } from '@/components/ConversationStarter';
import { FileUpload } from '@/components/FileUpload';
import { FileInfo } from '@/lib/types';
import { useAzureOpenAI } from '@/hooks/use-azure-openai';
import { useWorkflowConfig } from '@/hooks/use-workflow-config';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { useChatSession } from '@/hooks/use-chat-session';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatHistory as useChatHistoryHook } from '@/hooks/use-chat-history';
import { useChatSession as useChatSessionHook } from '@/hooks/use-chat-session';
import { useChatMessages as useChatMessagesHook } from '@/hooks/use-chat-messages';
import { useChat as useChatHook } from '@/hooks/use-chat';
import { useAzureOpenAI as useAzureOpenAIHook } from '@/hooks/use-azure-openai';
import { useWebSearch as useWebSearchHook } from '@/hooks/use-web-search';
import { useWorkflowConfig as useWorkflowConfigHook } from '@/hooks/use-workflow-config';
import { useUser as useUserHook } from '@/hooks/use-user';
import { useAuth as useAuthHook } from '@/hooks/use-auth';
import { useChatHistory as useChatHistoryHook2 } from '@/hooks/use-chat-history';
import { useChatSession as useChatSessionHook2 } from '@/hooks/use-chat-session';
import { useChatMessages as useChatMessagesHook2 } from '@/hooks/use-chat-messages';
import { useChat as useChatHook2 } from '@/hooks/use-chat';
import { useAzureOpenAI as useAzureOpenAIHook2 } from '@/hooks/use-azure-openai';
import { useWebSearch as useWebSearchHook2 } from '@/hooks/use-web-search';
import { useWorkflowConfig as useWorkflowConfigHook2 } from '@/hooks/use-workflow-config';
import { useUser as useUserHook2 } from '@/hooks/use-user';
import { useAuth as useAuthHook2 } from '@/hooks/use-auth';

interface UIMessage extends ChatMessage {
  id: string;
  timestamp: string;
  isError?: boolean;
  sender: "user" | "bot";
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
  title?: string;
  starters?: ConversationStarter[];
  workflowColor?: string;
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

interface SearchChatProps {
  autoFocus?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (text: string, files: File[]) => void;
  disableNavigation?: boolean;
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
}

const ChatInterface = ({ 
  onClose, 
  workflowTitle = "Chat Assistant",
  workflowId = "default-workflow",
  userName = "Moin Arian",
  userId = "default-user",
  sessionId: propSessionId,
  conversationStarters = [],
  systemPrompt: propSystemPrompt,
  title: propTitle,
  starters: propStarters,
  workflowColor: propWorkflowColor
}: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const urlWorkflowId = searchParams.get('workflowId');
  const urlQuery = searchParams.get('query');
  const urlSystemPrompt = searchParams.get('systemPrompt');
  const urlTitle = searchParams.get('title');
  const urlStarters = searchParams.get('starters');
  const urlWorkflowColor = searchParams.get('color');
  
  // Debug logs for URL parameters
  console.log('URL Parameters:', {
    urlWorkflowId,
    urlSessionId,
    urlQuery,
    urlSystemPrompt,
    urlTitle,
    urlStarters,
    urlWorkflowColor
  });
  
  // Use session ID from props or URL
  const effectiveSessionId = propSessionId || urlSessionId;
  
  // Use workflow ID from props or URL
  const effectiveWorkflowId = urlWorkflowId || workflowId || "default-workflow";
  
  // Use title from URL or props
  const effectiveTitle = urlTitle ? decodeURIComponent(urlTitle) : propTitle || workflowTitle;
  
  // Use starters from URL or props
  const effectiveStarters = urlStarters ? JSON.parse(decodeURIComponent(urlStarters)) : propStarters || [];
  
  // Use workflow color from URL or props
  const effectiveColor = urlWorkflowColor ? decodeURIComponent(urlWorkflowColor) : propWorkflowColor || '#3B82F6';
  
  // Determine effective values
  const effectiveUserId = userId || 'default-user';
  
  // Debug logs for effective values
  console.log('Effective Values:', {
    effectiveWorkflowId,
    effectiveSessionId,
    effectiveTitle,
    effectiveStarters,
    effectiveColor,
    effectiveUserId
  });
  
  const [inputText, setInputText] = useState('');
  const [showStarters, setShowStarters] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState<string>('');
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isNewChat, setIsNewChat] = useState(!urlSessionId);
  
  const loadWorkflowConfig = async () => {
    try {
      setIsLoadingConfig(true);
      console.log('ChatInterface: Loading workflow config for:', effectiveWorkflowId);
      const config = await apiService.getWorkflowConfig(effectiveWorkflowId);
      console.log('ChatInterface: Loaded workflow config:', config);
      setWorkflowConfig(config);
    } catch (error) {
      console.error('ChatInterface: Error loading workflow config:', error);
      // Fallback to default config if loading fails
      const fallbackConfig = {
        id: effectiveWorkflowId,
        title: effectiveTitle,
        description: '',
        icon_name: 'default',
        color: effectiveColor,
        conversation_starters: effectiveStarters,
        system_prompt: propSystemPrompt || urlSystemPrompt || ""
      };
      console.log('ChatInterface: Using fallback config:', fallbackConfig);
      setWorkflowConfig(fallbackConfig);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Load workflow configuration when workflowId changes
  useEffect(() => {
    loadWorkflowConfig();
  }, [effectiveWorkflowId]);

  // Debug log for current workflow config
  useEffect(() => {
    console.log('Current workflow config:', workflowConfig);
  }, [workflowConfig]);

  // Initialize chat history with the correct workflow
  const { 
    currentSession: historyCurrentSession, 
    sessions: historySessions,
    isLoading: historyLoading, 
    error: historyError,
    createSession: historyCreateSession,
    addMessage: historyAddMessage,
    loadSession: historyLoadSession
  } = useChatHistory({
    userId,
    workflowId: effectiveWorkflowId,
    workflowTitle: effectiveTitle,
    sessionId: effectiveSessionId,
    systemPrompt: propSystemPrompt || urlSystemPrompt || ""
  });

  // Load session messages when session ID changes
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (effectiveSessionId) {
          console.log('A. Starting loadSession with effectiveSessionId:', effectiveSessionId);
          
          // Get the full session object which includes messages
          const session = await apiService.getSession(effectiveSessionId, effectiveUserId);
          console.log('B. Full session data:', {
            id: session.id,
            messages: session.messages?.length || 0,
            messages: session.messages
          });
          
          if (session.messages && session.messages.length > 0) {
            console.log('C. Setting messages from session:', session.messages);
            setMessages(session.messages);
            setShowStarters(false);
          } else {
            console.log('D. No messages found, showing starters');
            setMessages([]);
            setShowStarters(true);
            
            // Add system message only if we have no messages and no existing system message
            const systemPrompt = workflowConfig?.system_prompt || propSystemPrompt || urlSystemPrompt;
            if (systemPrompt) {
              try {
                // Check if a system message already exists
                const hasSystemMessage = session.messages?.some(msg => msg.role === 'system');
                if (!hasSystemMessage) {
                  console.log('E. Adding system message');
                  await apiService.addMessage(effectiveSessionId, effectiveUserId, {
                    role: 'system',
                    content: systemPrompt
                  });
                  console.log('F. System message added successfully');
                } else {
                  console.log('G. System message already exists, skipping');
                }
              } catch (err) {
                console.error('H. Failed to add system message:', err);
                toast.error('Failed to initialize chat session');
              }
            }
          }
        }
      } catch (error) {
        console.error('I. Error in loadSession:', error);
        toast.error('Failed to load chat history. Please try again.');
        setMessages([]);
        setShowStarters(true);
      }
    };

    loadSession();
  }, [effectiveSessionId, workflowConfig, propSystemPrompt, urlSystemPrompt, effectiveUserId]);

  // Azure OpenAI chat hook with web search enabled
  const { 
    messages: azureMessages, 
    isLoading: azureLoading, 
    error: azureError, 
    sendMessage 
  } = useAzureChat({
    systemPrompt: workflowConfig?.system_prompt || propSystemPrompt || urlSystemPrompt || "",
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

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use scrollIntoView on the last message
        const lastMessage = viewport.querySelector('.message-container:last-child');
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
          // Fallback to scrolling the viewport
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
  };

  // Scroll to bottom when messages change or when thinking indicator appears
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, processingMessageId]);

  const handleClose = () => {
    // Navigate back to the dashboard and replace the current history entry
    navigate('/dashboard', { replace: true });
  };
  
  const handleStarterClick = async (starter: string) => {
    if (!starter.trim() || isLoading) return;

    setIsLoading(true);
    const userMessageId = `user-${Date.now()}`;
    const thinkingMessageId = `thinking-${Date.now()}`;

    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: starter,
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: effectiveUserId
      };

      setMessages(prev => [...prev, userMessage]);

      // Add thinking message
      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: effectiveUserId,
        isThinking: true
      };

      setMessages(prev => [...prev, thinkingMessage]);

      // Send message to API
      const response = await apiService.sendMessage({
        sessionId: effectiveSessionId,
        userId: effectiveUserId,
        message: starter,
        fileIds: [],
        systemPrompt: urlSystemPrompt
      });

      // Remove thinking message and add assistant response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: effectiveUserId
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowStarters(false);
    } catch (error) {
      console.error('Error sending starter message:', error);
      toast.error('Failed to send message');
      // Remove thinking message on error
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (text: string, files: File[] = []) => {
    if (!text.trim() && files.length === 0) return;
    setIsLoading(true);
    const userMessageId = `user-${Date.now()}`;
    const thinkingMessageId = `thinking-${Date.now()}`;

    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: 'default-user',
        files: files.map(file => ({
          id: `file-${Date.now()}-${file.name}`,
          size: file.size,
          content_type: file.type
        }))
      };

      setMessages(prev => [...prev, userMessage]);

      // Add thinking message
      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: 'default-user',
        isThinking: true
      };

      setMessages(prev => [...prev, thinkingMessage]);

      // Clear input and files
      setInputText('');
      setUploadedFiles([]);

      // Upload files if any
      const fileIds = [];
      for (const file of files) {
        try {
          const fileInfo = await apiService.uploadFile(file);
          fileIds.push(fileInfo.id);
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('Failed to upload file');
        }
      }

      // Send message to API
      const response = await apiService.sendMessage({
        sessionId: effectiveSessionId,
        userId: effectiveUserId,
        message: text,
        fileIds,
        systemPrompt: urlSystemPrompt
      });

      // Remove thinking message and add assistant response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        workflowId: effectiveWorkflowId,
        workflowTitle: effectiveTitle,
        userId: effectiveUserId
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove thinking message on error
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Convert text color class to hex color
  const getColorFromClass = (colorClass: string) => {
    if (!colorClass) return '#3B82F6';
    if (colorClass.startsWith('text-')) {
      // Convert Tailwind color classes to hex
      const colorMap: Record<string, string> = {
        'text-red-500': '#EF4444',
        'text-blue-500': '#3B82F6',
        'text-green-500': '#10B981',
        'text-yellow-500': '#F59E0B',
        'text-purple-500': '#8B5CF6',
        'text-pink-500': '#EC4899',
        'text-gray-500': '#6B7280'
      };
      return colorMap[colorClass] || '#3B82F6';
    }
    return colorClass;
  };

  const displayColor = getColorFromClass(effectiveColor);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm z-10 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="text-xl font-medium" style={{ color: displayColor }}>
            {effectiveTitle}
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
        <div className="flex-1 flex flex-col relative bg-gray-50">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 pt-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-4 bg-gray-50">
              {showStarters && (
                <div className="mb-8 flex flex-col items-center justify-center pt-12">
                  <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: displayColor }}>
                    {effectiveTitle}
                  </h2>
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
              {messages
                .filter(message => message.role !== 'system')
                .map((message, index) => (
                <div key={`${message.id}-${index}`} className="message-container">
                  {message.role === "user" && (
                    <div className="flex justify-end">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="rounded-lg p-4 text-white" style={{ backgroundColor: displayColor }}>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: displayColor }}>
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {(message.role === "assistant" || message.role === "system") && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                          <Feather className="h-5 w-5" style={{ color: displayColor }} />
                        </div>
                        <div className="rounded-lg p-4 bg-gray-100 text-gray-800">
                          {message.isThinking ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse flex space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                              </div>
                              <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {processingMessageId && (
                <div className="flex justify-start mt-2">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                      <Feather className="h-5 w-5" style={{ color: displayColor }} />
                    </div>
                    <div className="rounded-lg p-4 bg-gray-100 text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="sticky bottom-0 border-t p-4 bg-white">
          <SearchChat 
            autoFocus={true} 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onSubmit={handleSubmit}
            disableNavigation={true}
            onSearch={() => {}}
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
  );
};

export default ChatInterface;
