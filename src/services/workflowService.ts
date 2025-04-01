
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
    return apiRequest("/workflows", "POST", workflow);
  }
  
  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    return apiRequest(`/workflows/${id}`, "PUT", workflow);
  }
  
  async deleteWorkflow(id: string): Promise<void> {
    return apiRequest(`/workflows/${id}`, "DELETE");
  }
  
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Workflow> {
    return apiRequest(`/workflows/${id}/favorite`, "PUT", { isFavorite });
  }
}

export const workflowService = new WorkflowService();
