
import { toast } from "sonner";

// Base API URL - you would replace this with your actual backend URL
const API_BASE_URL = "https://api.example.com";

// Generic error handler for API requests
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const errorMessage = error.response?.data?.message || "Something went wrong";
  toast.error(errorMessage);
  return Promise.reject(error);
};

// Generic API request function
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  data: any = null,
  headers: any = {}
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
