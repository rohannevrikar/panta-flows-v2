
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { useTheme } from '@/frontend/contexts/ThemeContext';

const ClientWorkflowLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { theme, updateTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load client data if user has clientId
        if (user.clientId) {
          // For a real implementation, we would fetch client data from an API
          // const client = await clientService.getClientById(user.clientId);
          
          // For now, we'll just use the theme from ThemeContext
          // We won't need to set it since it's already handled by ThemeContext
          
          // For client admins, ensure their workflows are created
          if (user.role === 'client_admin') {
            // In a real implementation, we would check for workflows and create them if needed
            // const workflows = await workflowService.getWorkflows();
            // if (!workflows || workflows.length === 0) {
            //   await workflowService.createWorkflow({...});
            // }
          }
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [user, updateTheme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientWorkflowLoader;
