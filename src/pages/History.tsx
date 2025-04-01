
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Image, 
  Code, 
  MessageSquare,
  Search,
  ArrowLeft,
  LucideIcon
} from "lucide-react";
import HistoryItem from "@/components/HistoryItem";
import ProfileDropdown from "@/components/ProfileDropdown";
import Logo from "@/components/Logo";

// Define the history item type with the correct LucideIcon type
interface HistoryItemType {
  id: string;
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: LucideIcon;
  status: "completed" | "failed" | "in-progress";
  isFavorite: boolean;
}

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
  // Additional history items
  {
    id: "hist5",
    title: "Project documentation",
    workflowType: "Document Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    icon: FileText,
    status: "completed",
    isFavorite: true
  },
  {
    id: "hist6",
    title: "API integration code",
    workflowType: "Code Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    icon: Code,
    status: "completed",
    isFavorite: false
  },
  {
    id: "hist7",
    title: "Marketing campaign images",
    workflowType: "Image Creator",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    icon: Image,
    status: "completed",
    isFavorite: true
  },
  {
    id: "hist8",
    title: "User feedback analysis",
    workflowType: "Chat Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    icon: MessageSquare,
    status: "in-progress",
    isFavorite: false
  }
];

const History = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] = useState<HistoryItemType[]>(historyItems);
  
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

  const filteredHistory = historyData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.workflowType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-black hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo />
          </div>
          <ProfileDropdown 
            name="Moin Arian" 
            email="moin@example.com"
            avatarUrl="/placeholder.svg"
          />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Chat History</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No history items found</p>
            </div>
          ) : (
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
                  navigate('/chat');
                }}
                onFavoriteToggle={() => toggleFavorite(item.id)}
                onRename={(newName) => renameHistoryItem(item.id, newName)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
