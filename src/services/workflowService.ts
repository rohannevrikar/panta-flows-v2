
import { apiRequest } from "./api";
import { LucideIcon } from "lucide-react";

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

export const workflowService = {
  getWorkflows: () => {
    return apiRequest("/workflows");
  },
  
  getWorkflowById: (id: string) => {
    return apiRequest(`/workflows/${id}`);
  },
  
  createWorkflow: (workflow: Partial<Workflow>) => {
    return apiRequest("/workflows", "POST", workflow);
  },
  
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => {
    return apiRequest(`/workflows/${id}`, "PUT", workflow);
  },
  
  deleteWorkflow: (id: string) => {
    return apiRequest(`/workflows/${id}`, "DELETE");
  },
  
  toggleFavorite: (id: string, isFavorite: boolean) => {
    return apiRequest(`/workflows/${id}/favorite`, "PUT", { isFavorite });
  },
};
