
import React, { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getClientWorkflows } from "@/lib/client-themes";
import { useToast } from "@/hooks/use-toast";
import { workflowService } from "@/services/workflowService";
import { useAuth } from "@/contexts/AuthContext";

interface ClientWorkflowLoaderProps {
  children: React.ReactNode;
}

const ClientWorkflowLoader = ({ children }: ClientWorkflowLoaderProps) => {
  const { clientId } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load client-specific workflows when user logs in
  useEffect(() => {
    const loadClientWorkflows = async () => {
      // Only proceed if user is logged in
      if (!user) return;
      
      try {
        // Get existing workflows
        const existingWorkflows = await workflowService.getWorkflows();
        
        // Get client-specific workflows
        const clientWorkflows = getClientWorkflows(clientId);
        
        // Only add workflows that don't exist yet (by title)
        const existingTitles = existingWorkflows.map(wf => wf.title);
        
        // Filter out workflows that already exist
        const newWorkflows = clientWorkflows.filter(
          wf => !existingTitles.includes(wf.title)
        );
        
        // Add each new workflow
        for (const workflow of newWorkflows) {
          await workflowService.createWorkflow({
            title: workflow.title,
            description: workflow.description,
            iconName: workflow.iconName,
            color: workflow.color,
          });
        }
        
        if (newWorkflows.length > 0) {
          toast({
            title: "Client workflows added",
            description: `${newWorkflows.length} workflows for ${clientId} have been added to your account.`,
          });
        }
      } catch (error) {
        console.error("Error loading client workflows:", error);
      }
    };
    
    loadClientWorkflows();
  }, [clientId, user, toast]);

  return <>{children}</>;
};

export default ClientWorkflowLoader;
