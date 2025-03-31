import { useState } from "react";
import { 
  Plus, 
  ChevronLeft, 
  MessageSquare,
  Code,
  Image,
  FileText,
  Video,
  Music
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
import HistoryItem from "./HistoryItem";
import { useNavigate } from "react-router-dom";

interface ChatHistoryItem {
  id: string;
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: typeof MessageSquare;
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
                <div className="p-2 space-y-2">
                  {chatHistory.map((chat) => (
                    <HistoryItem
                      key={chat.id}
                      title={chat.title}
                      workflowType={chat.workflowType}
                      timestamp={chat.timestamp}
                      icon={chat.icon}
                      status={chat.status}
                      isFavorite={chat.isFavorite}
                      onFavoriteToggle={() => toggleFavorite(chat.id)}
                      onRename={(newName) => renameChat(chat.id, newName)}
                    />
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
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton tooltip={chat.title}>
                        <chat.icon size={18} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
