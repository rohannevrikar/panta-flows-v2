
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/frontend/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import WorkflowCard from '@/frontend/components/WorkflowCard';
import NewWorkflowDialog from '@/frontend/components/NewWorkflowDialog';
import HistoryItem from '@/frontend/components/HistoryItem';
import { workflowService } from '@/frontend/services/workflowService';
import { historyService } from '@/frontend/services/historyService';
import { Workflow } from '@/frontend/components/NewWorkflowDialog';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('workflows');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (activeTab === 'workflows') {
          const workflowsData = await workflowService.getWorkflows();
          setWorkflows(workflowsData || []);
        } else if (activeTab === 'recent') {
          const historyData = await historyService.getHistoryItems();
          setHistory(historyData || []);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
        toast.error(`Failed to load ${activeTab}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleWorkflowClick = (workflowId: string) => {
    navigate(`/workflow/${workflowId}`);
  };

  const handleHistoryItemClick = (historyId: string) => {
    navigate(`/history/${historyId}`);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await workflowService.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(workflow => workflow.id !== workflowId));
      toast.success('Workflow deleted successfully');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const handleToggleFavorite = async (workflow: Workflow) => {
    if (!workflow.id) return;
    
    try {
      const updatedWorkflow = { ...workflow, isFavorite: !workflow.isFavorite };
      await workflowService.updateWorkflow(updatedWorkflow);
      
      setWorkflows(workflows.map(w => 
        w.id === workflow.id ? updatedWorkflow : w
      ));
      
      toast.success(`${workflow.title} ${workflow.isFavorite ? 'removed from' : 'added to'} favorites`);
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  // Render placeholder when loading
  const renderPlaceholder = () => (
    <div className="text-center py-12">
      <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-500">Loading {activeTab}...</p>
    </div>
  );

  // Render empty state when no data
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <PlusCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-1">No {activeTab} found</h3>
      {activeTab === 'workflows' ? (
        <>
          <p className="text-gray-500 mb-4">Get started by creating your first workflow</p>
          <Button onClick={() => setShowNewWorkflowDialog(true)}>
            Create Workflow
          </Button>
        </>
      ) : (
        <p className="text-gray-500 mb-4">Your recent interactions will appear here</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        
        {activeTab === 'workflows' && (
          <Button onClick={() => setShowNewWorkflowDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {isMobile ? 'New' : 'New Workflow'}
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="workflows" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="recent">Recent History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="space-y-4">
          {isLoading ? (
            renderPlaceholder()
          ) : workflows.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workflows.map((workflow) => (
                <WorkflowCard 
                  key={workflow.id}
                  id={workflow.id || ''}
                  title={workflow.title}
                  description={workflow.description}
                  iconName={workflow.iconName}
                  isFavorite={workflow.isFavorite}
                  isPublic={workflow.isPublic}
                  onClick={() => workflow.id && handleWorkflowClick(workflow.id)}
                  onDelete={() => workflow.id && handleDeleteWorkflow(workflow.id)}
                  onToggleFavorite={() => handleToggleFavorite(workflow)}
                />
              ))}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {isLoading ? (
            renderPlaceholder()
          ) : history.length > 0 ? (
            <div className="space-y-2 max-w-2xl mx-auto">
              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  iconName={item.iconName || 'MessageSquare'}
                  timestamp={new Date(item.timestamp || item.createdAt)}
                  status={item.status || 'completed'}
                  onClick={handleHistoryItemClick}
                />
              ))}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>
      </Tabs>
      
      <NewWorkflowDialog 
        open={showNewWorkflowDialog} 
        onOpenChange={setShowNewWorkflowDialog} 
      />
    </div>
  );
};

export default Index;
