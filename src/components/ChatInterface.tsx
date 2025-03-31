
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, ChevronRight, X } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ChatSidebar from "./ChatSidebar";
import SearchChat from "./SearchChat";
import { Collapsible } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ProfileDropdown from "./ProfileDropdown";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose?: () => void;
}

const ChatInterface = ({ onClose }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="text-xl font-medium panta-gradient-text">Moin Arian</div>
          
          <ProfileDropdown 
            name="Moin Arian" 
            email="moin@example.com"
          />
        </div>
      </header>
      
      {/* Chat Interface with Sidebar */}
      <SidebarProvider defaultOpen={true} className="flex-1">
        <div className="flex h-full bg-gray-50 relative">
          <ChatSidebar />
          
          <div className="flex-1 flex flex-col relative">
            <div className="absolute top-4 left-4 z-10">
              <SidebarTrigger />
            </div>
            
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClose}
                className="rounded-full hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close chat</span>
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4 pt-16">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
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
                          <Bot className="h-5 w-5 text-panta-blue" />
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
              <SearchChat autoFocus={true} />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ChatInterface;
