
import { useState } from "react";
import { MessageSquare, Plus, Clock, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryItem from "./HistoryItem";

interface ChatHistoryItem {
  id: string;
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: typeof MessageSquare;
  status: "completed" | "processing" | "failed";
  isFavorite: boolean;
}

const ChatSidebar = () => {
  const [activeTab, setActiveTab] = useState("recent");
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
      icon: MessageSquare,
      status: "completed",
      isFavorite: false
    },
    {
      id: "chat3",
      title: "Product design ideas",
      workflowType: "Image Creator",
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      icon: MessageSquare,
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

  const favoriteChats = chatHistory.filter(chat => chat.isFavorite);

  return (
    <div className="w-80 border-r h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <Button className="w-full flex gap-2" size="sm">
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-2 pt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="recent" className="flex gap-2 items-center">
              <Clock size={14} />
              Recent
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex gap-2 items-center">
              <Star size={14} />
              Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recent" className="flex-1 mt-0">
          <ScrollArea className="h-full pr-4">
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
        </TabsContent>
        
        <TabsContent value="favorites" className="flex-1 mt-0">
          <ScrollArea className="h-full pr-4">
            <div className="p-2 space-y-2">
              {favoriteChats.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No favorite chats yet
                </div>
              ) : (
                favoriteChats.map((chat) => (
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
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatSidebar;
