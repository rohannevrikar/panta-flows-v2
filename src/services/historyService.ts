
import { apiRequest } from "./api";

export interface HistoryItem {
  id: string;
  title: string;
  workflowType: string;
  workflowId: string;
  timestamp: string;
  iconName: string;
  status: "completed" | "failed" | "processing";
  isFavorite: boolean;
  content?: string;
}

export const historyService = {
  getHistoryItems: (filters?: { workflowType?: string; status?: string }) => {
    let queryParams = "";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.workflowType) params.append("workflowType", filters.workflowType);
      if (filters.status) params.append("status", filters.status);
      queryParams = `?${params.toString()}`;
    }
    return apiRequest(`/history${queryParams}`);
  },
  
  getHistoryItemById: (id: string) => {
    return apiRequest(`/history/${id}`);
  },
  
  createHistoryItem: (item: Partial<HistoryItem>) => {
    return apiRequest("/history", "POST", item);
  },
  
  updateHistoryItem: (id: string, item: Partial<HistoryItem>) => {
    return apiRequest(`/history/${id}`, "PUT", item);
  },
  
  deleteHistoryItem: (id: string) => {
    return apiRequest(`/history/${id}`, "DELETE");
  },
  
  toggleFavorite: (id: string, isFavorite: boolean) => {
    return apiRequest(`/history/${id}/favorite`, "PUT", { isFavorite });
  },
};
