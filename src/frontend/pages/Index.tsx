
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { useTheme } from '@/frontend/contexts/ThemeContext';
import { workflowService } from '@/frontend/services/workflowService';
import { Button } from '@/frontend/components/ui/button';
import { Card } from '@/frontend/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import WorkflowCard from '@/frontend/components/WorkflowCard';
import NewWorkflowDialog from '@/frontend/components/NewWorkflowDialog';
import { toast } from 'sonner';
import { UserRole } from '@/services/types';

// Workflow type
interface Workflow {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isFavorite: boolean;
  isPublic: boolean;
  clientId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const Index = () => {
  const { user } = useAuth();
  const { clientId } = useTheme();
  const [workflowItems, setWorkflowItems] = useState<Workflow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    loadWorkflows();
  }, [activeTab, clientId]);
  
  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      // Use filter based on activeTab
      let filter = {};
      if (activeTab === "favorites") {
        filter = { isFavorite: true };
      }
      
      const items = await workflowService.getWorkflows(filter);
      setWorkflowItems(items);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error("Could not load workflows. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async (data: Partial<Workflow>) => {
    try {
      await workflowService.createWorkflow({
        ...data,
        clientId,
        isPublic: true
      });
      toast.success("Workflow created successfully!");
      loadWorkflows();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error("Failed to create workflow. Please try again.");
    }
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      await workflowService.updateWorkflow(id, { isFavorite: !currentValue });
      // Update the local state
      setWorkflowItems(workflowItems.map(item => 
        item.id === id ? { ...item, isFavorite: !currentValue } : item
      ));
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error("Failed to update workflow. Please try again.");
    }
  };

  const canCreateWorkflow = user && (user.role === "client_admin" as UserRole || user.role === "super_admin" as UserRole);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflows</h1>
        {canCreateWorkflow && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : workflowItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowItems.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  id={workflow.id}
                  title={workflow.title}
                  description={workflow.description}
                  iconName={workflow.iconName}
                  isFavorite={workflow.isFavorite}
                  onClick={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border rounded-lg">
              <p className="text-muted-foreground">No workflows found.</p>
              {canCreateWorkflow && (
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Create your first workflow
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewWorkflowDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateWorkflow}
      />
    </div>
  );
};

export default Index;
