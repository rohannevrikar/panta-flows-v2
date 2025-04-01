
# API Endpoints Documentation

This document describes all frontend services and their corresponding backend endpoints used in the application.

## Table of Contents
- [Authentication Service](#authentication-service)
- [Workflow Service](#workflow-service)
- [History Service](#history-service)
- [Chat Service](#chat-service)
- [Language Service](#language-service)
- [API Request Utility](#api-request-utility)

## Authentication Service

File: `src/services/authService.ts`

The authentication service uses Firebase Authentication for user management.

### Functions

| Function | Description | Backend Endpoint |
|----------|-------------|-----------------|
| `login(credentials)` | Authenticates a user with email and password | Firebase Auth |
| `loginWithGoogle()` | Authenticates a user with Google | Firebase Auth |
| `logout()` | Signs out the current user | Firebase Auth |
| `register(userData)` | Registers a new user | Firebase Auth |
| `getCurrentUser()` | Gets the current authenticated user | Firebase Auth |
| `updateProfile(userData)` | Updates the user's profile | Firebase Auth |

## Workflow Service

File: `src/services/workflowService.ts`

Handles workflow operations.

### Functions

| Function | Description | Backend Endpoint |
|----------|-------------|-----------------|
| `getWorkflows()` | Retrieves all workflows for the current user | GET `/api/workflows` |
| `getWorkflowById(id)` | Retrieves a specific workflow by ID | GET `/api/workflows/{id}` |
| `createWorkflow(workflow)` | Creates a new workflow | POST `/api/workflows` |
| `updateWorkflow(id, workflow)` | Updates a workflow | PUT `/api/workflows/{id}` |
| `deleteWorkflow(id)` | Deletes a workflow | DELETE `/api/workflows/{id}` |
| `toggleFavorite(id, isFavorite)` | Toggles favorite status of a workflow | PUT `/api/workflows/{id}/favorite` |

### Data Models

```typescript
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
```

## History Service

File: `src/services/historyService.ts`

Manages user history items.

### Functions

| Function | Description | Backend Endpoint |
|----------|-------------|-----------------|
| `getHistoryItems(filters?)` | Retrieves history items with optional filtering | GET `/api/history` |
| `getHistoryItemById(id)` | Retrieves a specific history item | GET `/api/history/{id}` |
| `createHistoryItem(item)` | Creates a new history item | POST `/api/history` |
| `updateHistoryItem(id, item)` | Updates a history item | PUT `/api/history/{id}` |
| `deleteHistoryItem(id)` | Deletes a history item | DELETE `/api/history/{id}` |
| `toggleFavorite(id, isFavorite)` | Toggles favorite status of a history item | PUT `/api/history/{id}/favorite` |

### Data Models

```typescript
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
```

## Chat Service

Handled in: `backend/app/api/routes/chat.py`

Frontend interactions are primarily through the Chat Interface components.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/sessions` | GET | Retrieves all chat sessions for the current user |
| `/api/chat/sessions/{session_id}` | GET | Retrieves a specific chat session with messages |
| `/api/chat/message` | POST | Sends a message to the chat and gets a response |
| `/api/chat/sessions/{session_id}` | DELETE | Deletes a chat session and its messages |

### Data Models

```typescript
interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  workflowType?: string;
}

interface ChatResponse {
  message: string;
  sessionId: string;
}
```

## Language Service

File: `src/services/languageService.ts`

Manages translations and language preferences.

### Functions

| Function | Description | Backend Endpoint |
|----------|-------------|-----------------|
| `getTranslations()` | Retrieves all translations | GET `/api/translations` |
| `updateTranslation(key, values)` | Updates a translation | PUT `/api/translations/{key}` |
| `addTranslation(entry)` | Adds a new translation | POST `/api/translations` |
| `getUserLanguage()` | Gets the user's language preference | GET `/api/user/settings/language` |
| `setUserLanguage(language)` | Sets the user's language preference | PUT `/api/user/settings/language` |

### Data Models

```typescript
export interface TranslationEntry {
  key: string;
  en: string;
  de: string;
}
```

## API Request Utility

File: `src/services/api.ts`

Central utility for making API requests with error handling.

### Functions

| Function | Description |
|----------|-------------|
| `apiRequest(endpoint, method, data, headers)` | Makes an HTTP request to the specified API endpoint |

### Configuration

- Base API URL: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"`
- Automatically attaches authentication token from `localStorage`
- Handles error responses and displays toast notifications

### Usage Example

```typescript
// GET request
const data = await apiRequest("/workflows");

// POST request
const newItem = await apiRequest("/history", "POST", { title: "New item" });
```

## Authentication Flow

1. User logs in via Firebase Auth (email/password or Google)
2. Firebase returns an authentication token
3. Token is stored in localStorage as "auth_token"
4. All subsequent API requests include this token in the Authorization header
5. Backend validates the token and identifies the user

## Error Handling

The API utility (`apiRequest`) automatically handles errors:
- Logs errors to console
- Extracts error messages from response when available
- Displays toast notifications to the user
- Returns rejected promises for further handling at the caller level

