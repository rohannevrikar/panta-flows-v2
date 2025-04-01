
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { historyService } from "@/frontend/services/historyService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { Search } from "lucide-react";
import { getIconByName } from "@/frontend/utils/iconMap";
import HistoryItem from "@/frontend/components/HistoryItem";
import { toast } from "sonner";
import { useAuth } from "@/frontend/contexts/AuthContext";

// Simple type for history items
interface HistoryItemType {
  id: string;
  title: string;
  type: string;
  date: string;
  icon?: string;
  status: string;
  isFavorite: boolean;
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryItems = async () => {
      try {
        setLoading(true);
        // You can use real API here
        const response = await historyService.getHistory();
        
        const formattedItems = response.map((item: any) => ({
          id: item.id,
          title: item.title || "Untitled Session",
          type: item.workflowType || "chat",
          date: new Date(item.timestamp).toLocaleString(),
          icon: item.iconName || "MessageSquare",
          status: item.status || "completed",
          isFavorite: item.isFavorite || false,
        }));
        
        setHistoryItems(formattedItems);
        setFilteredItems(formattedItems);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryItems();
  }, [user]);

  useEffect(() => {
    let result = historyItems;
    
    // Filter by tab
    if (activeTab === "favorites") {
      result = result.filter(item => item.isFavorite);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(result);
  }, [searchTerm, activeTab, historyItems]);

  const handleFavoriteToggle = async (id: string) => {
    try {
      // Update item locally first for better UX
      setHistoryItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
      
      // Update on server
      await historyService.toggleFavorite(id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
      
      // Revert local change on error
      setHistoryItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">History</h1>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search history..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <HistoryItem
              key={item.id}
              id={item.id}
              title={item.title}
              date={item.date}
              icon={item.icon}
              status={item.status}
              isFavorite={item.isFavorite}
              onClick={() => navigate(`/chat/${item.id}`)}
              onFavoriteToggle={() => handleFavoriteToggle(item.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500 mb-4">No history items found</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
