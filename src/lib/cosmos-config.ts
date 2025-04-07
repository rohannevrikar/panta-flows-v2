export const COSMOS_CONFIG = {
  endpoint: import.meta.env.VITE_COSMOS_ENDPOINT || '',
  key: import.meta.env.VITE_COSMOS_KEY || '',
  databaseId: import.meta.env.VITE_COSMOS_DATABASE || 'chatview-db',
  containerId: import.meta.env.VITE_COSMOS_CONTAINER || 'chat-history'
}; 