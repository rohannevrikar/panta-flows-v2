
import { useState, useEffect, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getClientConfig } from "@/lib/client-themes";
import { workflowService } from "@/services/workflowService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ClientWorkflowLoaderProps {
  children: ReactNode;
}

const ClientWorkflowLoader = ({ children }: ClientWorkflowLoaderProps) => {
  const { clientId } = useTheme();
  const { user } = useAuth();
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
        
        // Only load default workflows for new clients or when requested
        if (clientConfig.workflows && clientConfig.workflows.length > 0) {
          console.log("Loading client-specific workflows for client:", clientId);
          
          // Get existing workflows to avoid duplicates
          const existingWorkflows = await workflowService.getWorkflows();
          const existingTitles = new Set(existingWorkflows.map(w => w.title));
          
          // Filter workflows that don't already exist
          const newWorkflows = clientConfig.workflows.filter(
            workflow => !existingTitles.has(workflow.title)
          );
          
          // Add new workflows if needed and user has appropriate permissions (admin)
          if (newWorkflows.length > 0 && user && (user.role === "super_admin" || user.role === "client_admin")) {
            for (const workflow of newWorkflows) {
              await workflowService.createWorkflow({
                ...workflow,
                client_id: clientId,
                is_public: true, // Default to public for pre-configured workflows
              });
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
    
    // Only load workflows if we have a clientId and user is authenticated
    if (clientId && user) {
      loadClientWorkflows();
    }
  }, [clientId, user]);

  return <>{children}</>;
};

export default ClientWorkflowLoader;
