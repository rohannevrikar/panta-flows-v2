export const AZURE_CONFIG = {
  endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '',
  apiKey: import.meta.env.VITE_AZURE_API_KEY || '',
  deploymentName: import.meta.env.VITE_AZURE_DEPLOYMENT_NAME || '',
  apiVersion: '2024-02-15-preview'
};

export const AZURE_HEADERS = {
  'api-key': AZURE_CONFIG.apiKey,
  'Content-Type': 'application/json',
}; 