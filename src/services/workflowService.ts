
import { apiRequest } from "./api";

export interface Workflow {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color?: string;
  translationKey?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPublic?: boolean;
  clientId?: string;
  assignedUserIds?: string[];
}

class WorkflowService {
  async getWorkflows(): Promise<Workflow[]> {
    try {
      return await apiRequest("/workflows");
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      return [];
    }
  }
  
  async getWorkflowById(id: string): Promise<Workflow> {
    return apiRequest(`/workflows/${id}`);
  }
  
  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    // Format the workflow data to match backend expectations
    const workflowData = {
      ...workflow,
      client_id: workflow.clientId,
      is_public: workflow.isPublic,
      assigned_user_ids: workflow.assignedUserIds,
      icon_name: workflow.iconName,
      translation_key: workflow.translationKey,
      is_favorite: workflow.isFavorite,
    };
    
    return apiRequest("/workflows", "POST", workflowData);
  }
  
  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    // Format the workflow data to match backend expectations
    const workflowData = {
      ...workflow,
      is_public: workflow.isPublic,
      assigned_user_ids: workflow.assignedUserIds,
      icon_name: workflow.iconName,
      translation_key: workflow.translationKey,
      is_favorite: workflow.isFavorite,
    };
    
    return apiRequest(`/workflows/${id}`, "PUT", workflowData);
  }
  
  async deleteWorkflow(id: string): Promise<void> {
    return apiRequest(`/workflows/${id}`, "DELETE");
  }
  
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Workflow> {
    return apiRequest(`/workflows/${id}/favorite`, "PUT", { isFavorite });
  }
}

export const workflowService = new WorkflowService();
