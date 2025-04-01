
import { useState } from "react";
import { 
  Plus, 
  ChevronLeft, 
  MessageSquare,
  Code,
  Image,
  FileText,
  Video,
  Music,
  Star
} from "lucide-react";

import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarTrigger,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface ChatHistoryItem {
  id: string;
  title: string;
  workflowType: string;
  icon: React.ElementType;
  timestamp: Date;
  status: "completed" | "processing" | "failed";
  isFavorite: boolean;
}

const workflows = [
  {
    id: "chat",
    title: "Chat Assistant",
    icon: MessageSquare
  },
  {
    id: "code",
    title: "Code Helper",
    icon: Code
  },
  {
    id: "image",
    title: "Image Creator",
    icon: Image
  },
  {
    id: "doc",
    title: "Document Helper",
    icon: FileText
  },
  {
    id: "video",
    title: "Video Generator",
    icon: Video
  },
  {
    id: "music",
    title: "Music Composer",
    icon: Music
  },
];

const ChatSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: "chat1",
      title: "Marketing strategy analysis",
      workflowType: "Chat Assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: MessageSquare,
      status: "completed",
      isFavorite: true
    },
    {
      id: "chat2",
      title: "Customer feedback summary",
      workflowType: "Document Helper",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      icon: FileText,
      status: "completed",
      isFavorite: false
    },
    {
      id: "chat3",
      title: "Product design ideas",
      workflowType: "Image Creator",
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      icon: Image,
      status: "failed",
      isFavorite: false
    }
  ]);

  const toggleFavorite = (id: string) => {
    setChatHistory(prev =>
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const renameChat = (id: string, newTitle: string) => {
    setChatHistory(prev =>
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };
  
  const handleNewChat = () => {
    navigate('/dashboard');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 flex items-center justify-between">
          {state === "expanded" && (
            <div className="text-lg font-semibold">Chats</div>
          )}
          <div className="flex items-center">
            <Button 
              className={cn(
                "flex gap-2", 
                state === "collapsed" ? "w-full" : "flex-1"
              )} 
              size="sm"
              onClick={handleNewChat}
            >
              <Plus size={16} />
              {state === "expanded" && "New Chat"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 md:hidden" 
              onClick={toggleSidebar}
            >
              <ChevronLeft size={16} />
            </Button>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {state === "expanded" && (
            <div className="px-2 mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">WORKFLOWS</div>
              <SidebarMenu>
                {workflows.map((workflow) => (
                  <SidebarMenuItem key={workflow.id}>
                    <SidebarMenuButton tooltip={workflow.title}>
                      <workflow.icon size={18} />
                      <span>{workflow.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          )}
          
          {state === "expanded" && (
            <div className="px-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">HISTORY</div>
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="p-2 space-y-1">
                  {chatHistory.map((chat) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex-shrink-0 mr-3 flex items-center">
                        <chat.icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0 line-clamp-1 text-sm">{chat.title}</div>
                      {chat.isFavorite && (
                        <Star className="w-4 h-4 ml-2 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {state === "collapsed" && (
            <SidebarMenu>
              <div className="mb-4">
                {workflows.map((workflow) => (
                  <SidebarMenuItem key={workflow.id}>
                    <SidebarMenuButton tooltip={workflow.title}>
                      <workflow.icon size={18} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
              
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-2 space-y-2">
                  {chatHistory.map((chat) => (
                    <TooltipProvider key={chat.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative flex justify-center">
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 rounded-full"
                            >
                              <chat.icon className="h-4 w-4" />
                              {chat.isFavorite && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">{chat.title}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </ScrollArea>
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ChatSidebar;
