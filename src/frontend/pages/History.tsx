
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Filter } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/frontend/components/ui/select";
import HistoryItem from "@/frontend/components/HistoryItem";
import { useLanguage } from "@/frontend/contexts/LanguageContext";

const History = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Mock history data
  const historyItems = [
    // ... history items data (similar to what is in Index.tsx)
  ];

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{translate('history.title')}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder={translate('history.search')}
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 md:w-40">
                <SelectValue placeholder={translate('history.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translate('history.all')}</SelectItem>
                <SelectItem value="completed">{translate('history.completed')}</SelectItem>
                <SelectItem value="processing">{translate('history.processing')}</SelectItem>
                <SelectItem value="failed">{translate('history.failed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {translate('history.noItems')}
            </div>
          ) : (
            filteredItems.map((item) => (
              <HistoryItem 
                key={item.id}
                title={item.title}
                workflowType={item.workflowType}
                timestamp={item.timestamp}
                icon={item.icon}
                status={item.status}
                isFavorite={item.isFavorite}
                onClick={() => navigate(`/chat?history=${item.id}`)}
                onFavoriteToggle={() => {}}
                onRename={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
