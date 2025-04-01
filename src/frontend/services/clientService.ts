
import { apiRequest } from "./api";

export interface Client {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  domain?: string;
  allowedEmailDomains?: string[];
}

export const clientService = {
  /**
   * Get a client by ID
   * @param clientId - The client ID
   * @returns The client data
   */
  getClientById: async (clientId: string): Promise<Client> => {
    // In a real implementation, this would call the API
    // return apiRequest(`/clients/${clientId}`, "GET");
    
    // Mock implementation for development
    return Promise.resolve({
      id: clientId,
      name: clientId.charAt(0).toUpperCase() + clientId.slice(1),
      primaryColor: clientId === 'panta' ? '#191919' : '#2D2D64',
      secondaryColor: '#FFFFFF',
      accentColor: clientId === 'panta' ? '#629FE7' : '#F26430',
      logo: `/clients/${clientId}/logo.svg`,
    });
  },
  
  /**
   * Get all clients (super admin only)
   * @returns List of all clients
   */
  getAllClients: async (): Promise<Client[]> => {
    // In a real implementation, this would call the API
    // return apiRequest("/clients", "GET");
    
    // Mock implementation for development
    return Promise.resolve([
      {
        id: 'panta',
        name: 'PANTA',
        primaryColor: '#191919',
        secondaryColor: '#FFFFFF',
        accentColor: '#629FE7',
        logo: '/clients/panta/logo.svg',
        domain: 'panta.io',
      },
      {
        id: 'zettaVal',
        name: 'ZettaVal',
        primaryColor: '#2D2D64',
        secondaryColor: '#F2F2F2',
        accentColor: '#F26430',
        logo: '/clients/zettaval/logo.svg',
        domain: 'zettaval.com',
      },
      {
        id: 'cloudVision',
        name: 'CloudVision',
        primaryColor: '#075E54',
        secondaryColor: '#FFFFFF',
        accentColor: '#25D366',
        logo: '/clients/cloudvision/logo.svg',
        domain: 'cloudvision.ai',
      },
    ]);
  },
  
  /**
   * Create a new client (super admin only)
   * @param clientData - The client data
   * @returns The created client
   */
  createClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    return apiRequest("/clients", "POST", clientData);
  },
  
  /**
   * Update a client (super admin or client admin)
   * @param clientId - The client ID
   * @param clientData - The updated client data
   * @returns The updated client
   */
  updateClient: async (clientId: string, clientData: Partial<Client>): Promise<Client> => {
    return apiRequest(`/clients/${clientId}`, "PUT", clientData);
  },
};
