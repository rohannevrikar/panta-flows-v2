
import { useState } from "react";
import { 
  ArrowLeft,
  LayoutDashboard,
  Star,
  FileText,
  Image,
  Code,
  MessageSquare,
  Video,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "@/components/ProfileDropdown";
import HistoryItem from "@/components/HistoryItem";
import Logo from "@/components/Logo";

type HistoryItemType = {
  id: string;
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: React.ElementType;
  status: "completed" | "processing" | "failed";
  isFavorite: boolean;
};

const historyItems: HistoryItemType[] = [
  {
    id: "hist1",
    title: "Summarized quarterly report",
    workflowType: "Document Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: FileText,
    status: "completed",
    isFavorite: false
  },
  {
    id: "hist2",
    title: "Generated product images",
    workflowType: "Image Creator",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    icon: Image,
    status: "completed",
    isFavorite: true
  },
  {
    id: "hist3",
    title: "Code refactoring assistant",
    workflowType: "Code Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    icon: Code,
    status: "failed",
    isFavorite: false
  },
  {
    id: "hist4",
    title: "Customer support chat analysis",
    workflowType: "Chat Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: MessageSquare,
    status: "completed",
    isFavorite: false
  },
  {
    id: "hist5",
    title: "Product launch video",
    workflowType: "Video Generator",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    icon: Video,
    status: "completed",
    isFavorite: true
  },
  {
    id: "hist6",
    title: "Audio podcast summary",
    workflowType: "Music Composer",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    icon: Music,
    status: "completed",
    isFavorite: false
  },
];

const History = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [historyData, setHistoryData] = useState(historyItems);

  const toggleFavorite = (id: string) => {
    setHistoryData(prev =>
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const renameHistoryItem = (id: string, newTitle: string) => {
    setHistoryData(prev =>
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  const filteredHistory = activeTab === 'all' 
    ? historyData 
    : activeTab === 'favorites' 
      ? historyData.filter(item => item.isFavorite)
      : historyData.filter(item => item.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-black hover:text-white"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo />
          </div>
          
          <h1 className="text-xl font-semibold">History</h1>
          
          <ProfileDropdown 
            name="Moin Arian" 
            email="moin@example.com"
          />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            className="gap-2 hover:bg-black hover:text-white"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="bg-white rounded-lg shadow-sm border">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  workflowType={item.workflowType}
                  timestamp={item.timestamp}
                  icon={item.icon}
                  status={item.status}
                  isFavorite={item.isFavorite}
                  onClick={() => {
                    console.log(`History item clicked: ${item.id}`);
                    navigate("/chat");
                  }}
                  onFavoriteToggle={() => toggleFavorite(item.id)}
                  onRename={(newName) => renameHistoryItem(item.id, newName)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No history items found in this category.
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default History;
