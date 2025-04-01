
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { clientService } from '@/frontend/services/clientService';
import { workflowService } from '@/frontend/services/workflowService';
import { useTheme } from '@/frontend/contexts/ThemeContext';

const ClientWorkflowLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { setTheme } = useTheme();
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
          const client = await clientService.getClientById(user.clientId);
          
          // Set theme based on client colors
          if (client) {
            setTheme({
              primaryColor: client.primaryColor || '#000000',
              secondaryColor: client.secondaryColor || '#ffffff',
              accentColor: client.accentColor || '#3b82f6',
              logo: client.logo || '',
              name: client.name || 'App',
            });
          }
          
          // For client admins, ensure their workflows are created
          if (user.role === 'client-admin') {
            // Check if default workflows exist, if not create them
            const workflows = await workflowService.getWorkflows();
            
            if (!workflows || workflows.length === 0) {
              // Create some default workflows for the client
              await workflowService.createWorkflow({
                title: 'Chat Assistant',
                description: 'General purpose AI assistant',
                iconName: 'MessageSquare',
                clientId: user.clientId,
                isPublic: true,
                isFavorite: true,
              });
              
              await workflowService.createWorkflow({
                title: 'Document Analysis',
                description: 'Upload and analyze documents',
                iconName: 'FileText',
                clientId: user.clientId,
                isPublic: true,
                isFavorite: false,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [user, setTheme]);

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
