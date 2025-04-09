import { useState, useEffect } from "react";
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
import { apiService, ChatSession } from "@/lib/api-service";

// Define the history item type with the correct LucideIcon type
interface HistoryItemSession extends ChatSession {
  isFavorite?: boolean;
}

interface HistoryItemType {
  id: string;
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: LucideIcon;
  status: "completed" | "failed" | "processing";
  isFavorite: boolean;
}

const History = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] = useState<HistoryItemSession[]>([]);
  
  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiService.getChatHistory('default-user', 20); // Load last 20 sessions
        // Add isFavorite property to each session
        const historyWithFavorites = history.map(session => ({
          ...session,
          isFavorite: false
        }));
        setHistoryData(historyWithFavorites);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    loadHistory();
  }, []);

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

  // Filter history based on search query
  const filteredHistory = historyData.filter(session =>
    session.workflowTitle.toLowerCase().includes(searchQuery.toLowerCase())
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
            filteredHistory.map((session) => (
              <HistoryItem
                key={session.id}
                title={session.workflowTitle}
                workflowType={session.workflowId}
                timestamp={new Date(session.updatedAt)}
                icon={MessageSquare}
                status="completed"
                isFavorite={false}
                onClick={() => navigate(`/chat?sessionId=${session.id}`)}
                onFavoriteToggle={() => toggleFavorite(session.id)}
                onRename={(newName) => renameHistoryItem(session.id, newName)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
