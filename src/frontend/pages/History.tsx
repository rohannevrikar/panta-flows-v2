
import React, { useEffect, useState } from 'react';
import { historyService } from '@/frontend/services/historyService';
import { useToast } from "@/frontend/hooks/use-toast";
import { Button } from '@/frontend/components/ui/button';
import { Card } from '@/frontend/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import HistoryItem from '@/frontend/components/HistoryItem';
import { HistoryItemStatus } from '@/services/types';

// History item type
interface HistoryItemType {
  id: string;
  title: string;
  date: Date | string;
  status: HistoryItemStatus | string;
  workflowType: string;
  content?: string;
}

const History = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [activeTab]);
  
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter = activeTab !== "all" ? { status: activeTab } : {};
      const items = await historyService.getHistoryItems(filter);
      setHistoryItems(items);
    } catch (error) {
      console.error('Error loading history:', error);
      setError("Failed to load history items");
      toast.error("Could not load your history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await historyService.deleteHistoryItem(id);
      toast.success("History item has been deleted successfully.");
      // Reload history after deletion
      loadHistory();
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast.error("Could not delete history item. Please try again.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: HistoryItemStatus) => {
    try {
      await historyService.updateHistoryItem(id, { status: newStatus });
      const statusString = typeof newStatus === 'string' ? newStatus : newStatus.status;
      toast.success(`History item status changed to ${statusString}.`);
      // Reload history after status change
      loadHistory();
    } catch (error) {
      console.error('Error updating history item:', error);
      toast.error("Could not update history item status. Please try again.");
    }
  };

  // Map HistoryItemStatus to the string type expected by HistoryItem component
  const mapStatusToString = (status: HistoryItemStatus | string): "completed" | "failed" | "pending" | "in_progress" | "processing" => {
    if (typeof status === 'string') {
      return convertStatusString(status);
    }
    
    return convertStatusString(status.status);
  };
  
  // Helper function to convert status strings and handle the "in_progress" case
  const convertStatusString = (statusStr: string): "completed" | "failed" | "pending" | "in_progress" | "processing" => {
    // Map "in_progress" to "processing" for compatibility with HistoryItem component
    return statusStr === "in_progress" ? "processing" : statusStr as any;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-12 border rounded-lg bg-red-50">
          <p className="text-red-600 mb-2">{error}</p>
          <Button variant="outline" onClick={loadHistory}>
            Try Again
          </Button>
        </div>
      );
    }
    
    if (historyItems.length === 0) {
      return (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-muted-foreground">No history items found.</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-4">
        {historyItems.map(item => (
          <Card key={item.id} className="p-0 overflow-hidden">
            <HistoryItem
              id={item.id}
              title={item.title}
              timestamp={new Date(item.date)}
              status={mapStatusToString(item.status) as "completed" | "failed" | "pending" | "processing"}
              iconName={item.workflowType}
              onClick={() => handleDelete(item.id)}
            />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">History</h1>
        <Button 
          variant="outline"
          onClick={loadHistory}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
