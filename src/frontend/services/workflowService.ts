
import { apiRequest } from "./api";

export interface Workflow {
  id: string;
  title: string;
  description: string;
  iconName: string;
  clientId: string;
  userId?: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, any>;
}

export interface WorkflowCreateParams {
  title: string;
  description: string;
  iconName: string;
  clientId: string;
  isPublic: boolean;
  isFavorite: boolean;
  config?: Record<string, any>;
}

export interface WorkflowUpdateParams {
  title?: string;
  description?: string;
  iconName?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  config?: Record<string, any>;
}

export const workflowService = {
  /**
   * Get all workflows available to the current user
   * @returns List of workflows
   */
  getWorkflows: async () => {
    // In a real implementation, this would call the API
    // return apiRequest("/workflows", "GET");
    
    // Mock implementation for development
    return Promise.resolve([
      {
        id: 'w1',
        title: 'Chat Assistant',
        description: 'General purpose AI assistant',
        iconName: 'MessageSquare',
        clientId: 'panta',
        isPublic: true,
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'w2',
        title: 'Document Analysis',
        description: 'Upload and analyze documents',
        iconName: 'FileText',
        clientId: 'panta',
        isPublic: true,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  
  /**
   * Get a specific workflow by ID
   * @param id - Workflow ID
   * @returns The workflow
   */
  getWorkflowById: async (id: string): Promise<Workflow> => {
    return apiRequest(`/workflows/${id}`, "GET");
  },
  
  /**
   * Create a new workflow
   * @param workflow - The workflow data
   * @returns The created workflow
   */
  createWorkflow: async (workflow: WorkflowCreateParams): Promise<Workflow> => {
    // In a real implementation, this would call the API
    // return apiRequest("/workflows", "POST", workflow);
    
    // Mock implementation for development
    return Promise.resolve({
      ...workflow,
      id: `w${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'current-user-id',
    } as Workflow);
  },
  
  /**
   * Update an existing workflow
   * @param id - Workflow ID
   * @param workflow - The updated workflow data
   * @returns The updated workflow
   */
  updateWorkflow: async (id: string, workflow: WorkflowUpdateParams): Promise<Workflow> => {
    return apiRequest(`/workflows/${id}`, "PUT", workflow);
  },
  
  /**
   * Delete a workflow
   * @param id - Workflow ID
   */
  deleteWorkflow: async (id: string): Promise<void> => {
    return apiRequest(`/workflows/${id}`, "DELETE");
  },
  
  /**
   * Toggle a workflow's favorite status
   * @param id - Workflow ID
   * @param isFavorite - New favorite status
   */
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    return apiRequest(`/workflows/${id}/favorite`, "PUT", { isFavorite });
  },
};
