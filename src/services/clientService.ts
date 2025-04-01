
import { apiRequest } from "./api";

export interface Client {
  id: string;
  name: string;
  code: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
  tagline?: string;
  apiKeys?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeys {
  azureOpenai?: string;
  [key: string]: string | undefined;
}

class ClientService {
  async getClients(): Promise<Client[]> {
    try {
      const clients = await apiRequest("/clients");
      return clients;
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      return [];
    }
  }
  
  async getClientById(id: string): Promise<Client> {
    return apiRequest(`/clients/${id}`);
  }
  
  async createClient(client: Partial<Client>): Promise<Client> {
    // Format the client data to match backend expectations
    const clientData = {
      ...client,
      primary_color: client.primaryColor,
      secondary_color: client.secondaryColor,
      accent_color: client.accentColor,
    };
    
    return apiRequest("/clients", "POST", clientData);
  }
  
  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    // Format the client data to match backend expectations
    const clientData = {
      ...client,
      primary_color: client.primaryColor,
      secondary_color: client.secondaryColor,
      accent_color: client.accentColor,
    };
    
    return apiRequest(`/clients/${id}`, "PUT", clientData);
  }
  
  async updateApiKeys(id: string, apiKeys: ApiKeys): Promise<Client> {
    // Format the API keys to match backend expectations
    const apiKeysData = {
      azure_openai: apiKeys.azureOpenai,
      // Add other API keys as needed
    };
    
    return apiRequest(`/clients/${id}/api-keys`, "PUT", apiKeysData);
  }
  
  async deleteClient(id: string): Promise<void> {
    return apiRequest(`/clients/${id}`, "DELETE");
  }
}

export const clientService = new ClientService();
