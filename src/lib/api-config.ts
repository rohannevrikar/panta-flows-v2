export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    chat: '/api/chat/completions',
    sessions: '/api/cosmos/sessions',
    session: (sessionId: string, userId: string) => `/api/cosmos/sessions/${sessionId}/${userId}`,
    messages: (sessionId: string, userId: string) => `/api/cosmos/sessions/${sessionId}/${userId}/messages`,
    files: {
      upload: '/api/files/upload',
      list: '/api/files/list',
      search: '/api/files/search',
      delete: (fileId: string) => `/api/files/${fileId}`
    },
    webSearch: '/api/web-search/search'
  }
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
}; 