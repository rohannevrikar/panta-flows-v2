
import { useState, useEffect, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getClientConfig } from "@/lib/client-themes";
import { workflowService } from "@/services/workflowService";
import { toast } from "sonner";

interface ClientWorkflowLoaderProps {
  children: ReactNode;
}

const ClientWorkflowLoader = ({ children }: ClientWorkflowLoaderProps) => {
  const { clientId } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadClientWorkflows = async () => {
      try {
        setIsLoading(true);
        const clientConfig = getClientConfig(clientId);
        
        if (!clientConfig) {
          console.warn("Client configuration not found for ID:", clientId);
          return;
        }
        
        // Check if client has specific workflows defined
        if (clientConfig.workflows && clientConfig.workflows.length > 0) {
          console.log("Loading client-specific workflows for client:", clientId);
          
          // Get existing workflows to avoid duplicates
          const existingWorkflows = await workflowService.getWorkflows();
          const existingTitles = new Set(existingWorkflows.map(w => w.title));
          
          // Filter workflows that don't already exist
          const newWorkflows = clientConfig.workflows.filter(
            workflow => !existingTitles.has(workflow.title)
          );
          
          // Add new workflows if needed
          if (newWorkflows.length > 0) {
            for (const workflow of newWorkflows) {
              await workflowService.createWorkflow(workflow);
            }
            toast.success(`${newWorkflows.length} client workflows loaded`);
          }
        }
      } catch (error) {
        console.error("Error loading client workflows:", error);
        toast.error("Failed to load client workflows");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load workflows if we have a clientId
    if (clientId) {
      loadClientWorkflows();
    }
  }, [clientId]);

  return <>{children}</>;
};

export default ClientWorkflowLoader;
