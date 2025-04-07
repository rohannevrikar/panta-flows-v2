import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, X, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ProfileDropdown from "./ProfileDropdown";
import SearchChat from "./SearchChat";
import { useAzureChat } from "@/hooks/use-azure-chat";
import { useChatHistory } from "@/hooks/use-chat-history";
import { ChatMessage as AzureChatMessage } from "@/lib/azure-openai";

interface UIMessage extends AzureChatMessage {
  id: string;
  timestamp: Date;
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

const ChatInterface = ({ 
  onClose, 
  workflowTitle = "Chat Assistant",
  workflowId = "default-workflow",
  userName = "Moin Arian",
  userId = "default-user",
  sessionId,
  conversationStarters = [],
  systemPrompt
}: ChatInterfaceProps) => {
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
  
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [showStarters, setShowStarters] = useState(true);
  
  // Initialize chat history
  const { 
    currentSession, 
    isLoading: historyLoading, 
    error: historyError,
    createSession,
    addMessage
  } = useChatHistory({
    userId,
    workflowId,
    workflowTitle,
    sessionId
  });
  
  // Create a new session if none exists
  useEffect(() => {
    if (!currentSession && !sessionId) {
      createSession();
    }
  }, [currentSession, sessionId, createSession]);
  
  // Azure OpenAI chat hook
  const { 
    messages: azureMessages, 
    isLoading: azureLoading, 
    error: azureError, 
    sendMessage 
  } = useAzureChat({
    systemPrompt,
    temperature: 0.7,
    maxTokens: 800
  });

  // Convert Azure messages to UI messages
  const uiMessages: UIMessage[] = azureMessages.map(msg => ({
    ...msg,
    id: `${msg.role}-${Date.now()}`,
    timestamp: new Date(),
    sender: msg.role === 'user' ? 'user' : 'bot'
  }));

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
  };
  
  const handleStarterClick = async (text: string) => {
    setInput(text);
    setShowStarters(false);
    try {
      // Send message to Azure OpenAI
      const response = await sendMessage(text);
      
      // Save user message to history
      if (currentSession) {
        await addMessage({
          role: 'user',
          content: text,
          timestamp: new Date()
        });
        
        // Save assistant response to history
        if (response) {
          await addMessage({
            role: 'assistant',
            content: response.content,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = async (text: string, files: File[]) => {
    setShowStarters(false);
    try {
      // Send message to Azure OpenAI
      const response = await sendMessage(text);
      
      // Save user message to history
      if (currentSession) {
        await addMessage({
          role: 'user',
          content: text,
          timestamp: new Date()
        });
        
        // Save assistant response to history
        if (response) {
          await addMessage({
            role: 'assistant',
            content: response.content,
            timestamp: new Date()
          });
        }
      }
      
      setInput("");
    } catch (error) {
      console.error('Error sending message:', error);
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

              {uiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-panta-blue"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Feather className="h-5 w-5 text-panta-blue" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.sender === "user"
                          ? "bg-panta-blue text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-2 ${
                          message.sender === "user"
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
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
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
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
