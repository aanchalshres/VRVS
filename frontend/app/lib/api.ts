// app/lib/api.ts

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

function resolveApiEndpoint(endpoint: string) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  if (endpoint === "/api" || endpoint.startsWith("/api/")) {
    return endpoint;
  }

  return `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make an authenticated API request
 * Automatically includes the Authorization header if token exists
 */
export async function apiCall(
  endpoint: string,
  options: FetchOptions = {}
) {
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const resolvedEndpoint = resolveApiEndpoint(endpoint);
    console.debug(`[API] ${options.method || 'GET'} ${API_URL}${resolvedEndpoint}`);
    
    const response = await fetch(`${API_URL}${resolvedEndpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    console.debug(`[API] Response status: ${response.status}`);

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Handle 403 Forbidden - user doesn't have permission
    if (response.status === 403) {
      window.location.href = "/unauthorized";
    }

    return response;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error(`[API] Failed to fetch ${endpoint}:`, error);
    console.error(`[API] Error message:`, errorMsg);
    console.error(`[API] API URL being used:`, API_URL);
    
    throw new Error(`Failed to connect to API at ${API_URL}${endpoint}. Backend error: ${errorMsg}`);
  }
}

/**
 * Parse JSON response
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  // Check if response is OK first
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } else if (response.status === 404) {
        // For 404s, don't try to parse the HTML response body
        errorMessage = `Endpoint not found (404)`;
      }
      // For other non-JSON responses, just use the status
    } catch (e) {
      // If parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Invalid response: expected JSON');
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error('Failed to parse JSON response');
  }
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T>(endpoint: string) {
  const response = await apiCall(endpoint);

  if (!response.ok && response.status === 404) {
    const alternateEndpoint = endpoint.startsWith("/api/")
      ? endpoint.replace(/^\/api/, "")
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (alternateEndpoint !== endpoint) {
      const fallbackResponse = await apiCall(alternateEndpoint);
      return parseResponse<T>(fallbackResponse);
    }
  }

  return parseResponse<T>(response);
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T>(endpoint: string, data: unknown) {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T>(endpoint: string, data: unknown) {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T>(endpoint: string) {
  const response = await apiCall(endpoint, {
    method: "DELETE",
  });
  return parseResponse<T>(response);
}

/**
 * Upload a file via multipart/form-data (POST)
 * Does NOT set Content-Type so the browser adds the correct multipart boundary
 */
export async function apiUpload<T>(endpoint: string, formData: FormData) {
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resolvedEndpoint = resolveApiEndpoint(endpoint);

  const response = await fetch(`${API_URL}${resolvedEndpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (response.status === 403) {
    window.location.href = "/unauthorized";
  }

  return parseResponse<T>(response);
}

/**
 * Health check - test if backend is running
 */
export async function checkBackendHealth() {
  try {
    console.log(`[API] Checking backend health at ${API_URL}/api/health`);
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("[API] Backend is healthy:", data);
      return true;
    } else {
      console.log("[API] Backend returned status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("[API] Backend health check failed:", error);
    return false;
  }
}
