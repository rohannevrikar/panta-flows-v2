
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { workflowService } from "@/frontend/services/workflowService";
import { Search } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import WorkflowCard from "@/frontend/components/WorkflowCard";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import NewWorkflowDialog from "@/frontend/components/NewWorkflowDialog";
import { toast } from "sonner";

// Simplified type for the Workflow
interface Workflow {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isPublic: boolean;
  isFavorite: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [newWorkflowDialogOpen, setNewWorkflowDialogOpen] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
      setFilteredWorkflows(data);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = workflows.filter(workflow => 
        workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWorkflows(filtered);
    } else {
      setFilteredWorkflows(workflows);
    }
  }, [searchTerm, workflows]);

  const handleFavoriteToggle = async (id: string) => {
    try {
      // Update UI first for better UX
      setWorkflows(prevWorkflows => 
        prevWorkflows.map(workflow => 
          workflow.id === id ? { ...workflow, isFavorite: !workflow.isFavorite } : workflow
        )
      );
      
      // Update on server
      await workflowService.toggleFavorite(id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
      
      // Revert UI change on error
      setWorkflows(prevWorkflows => 
        prevWorkflows.map(workflow => 
          workflow.id === id ? { ...workflow, isFavorite: !workflow.isFavorite } : workflow
        )
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {user?.role === "admin" && (
          <ThemeSwitcher visible={true} />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search workflows..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setNewWorkflowDialogOpen(true)}>
          New Workflow
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {filteredWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  id={workflow.id}
                  title={workflow.title}
                  description={workflow.description}
                  iconName={workflow.iconName}
                  isFavorite={workflow.isFavorite}
                  onFavoriteToggle={() => handleFavoriteToggle(workflow.id)}
                  onClick={() => navigate(`/chat?workflowId=${workflow.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-4">No workflows found</p>
              <Button onClick={() => setNewWorkflowDialogOpen(true)}>
                Create New Workflow
              </Button>
            </div>
          )}
        </>
      )}
      
      <NewWorkflowDialog
        open={newWorkflowDialogOpen}
        onOpenChange={setNewWorkflowDialogOpen}
        onWorkflowCreated={fetchWorkflows}
      />
    </div>
  );
};

export default Index;
