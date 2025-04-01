
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
  status: HistoryItemStatus;
  workflowType: string;
  content?: string;
}

const History = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [activeTab]);
  
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Use getHistoryItems instead of getHistory
      const filter = activeTab !== "all" ? { status: activeTab } : {};
      const items = await historyService.getHistoryItems(filter);
      setHistoryItems(items);
    } catch (error) {
      console.error('Error loading history:', error);
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
  const mapStatusToHistoryItemStatus = (status: HistoryItemStatus): "completed" | "failed" | "pending" | "in_progress" | "processing" => {
    const statusValue = status.status;
    // Map "in_progress" to "processing" for compatibility with HistoryItem component
    return statusValue === "in_progress" ? "processing" : statusValue as any;
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
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : historyItems.length > 0 ? (
            <div className="grid gap-4">
              {historyItems.map(item => (
                <Card key={item.id} className="p-0 overflow-hidden">
                  <HistoryItem
                    id={item.id}
                    title={item.title}
                    timestamp={new Date(item.date)}
                    status={mapStatusToHistoryItemStatus(item.status)}
                    iconName={item.workflowType}
                    onClick={() => handleDelete(item.id)}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border rounded-lg">
              <p className="text-muted-foreground">No history items found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
