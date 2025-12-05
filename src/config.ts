// config.ts - FINAL VERSION: NO COOKIES, NO REDIRECT FROM KNOWLEDGE BASE, KB WORKS STABLY
import axios from "axios";

//
// ORIGINAL CONFIG (PRESERVED FOR OTHER PARTS OF APP)
//
const userConfig = {
  sip: "sip:",
  webSocketServerURL: "wss://10.16.7.91:7443/ws",
};

export const agentStatus = [
  "Available",
  "On Break",
  "Available (On Demand)",
  "Logged Out",
];

export const dbConfig = {
  baseURL: "https://10.16.7.202:3000",
  emailTemplates: "email-templates",
  knowledgeArticles: "knowledge-articles",
  customers: "customers",
  interactions: "interactions",
};

export const backendConfig = {
  baseURL: "https://10.16.7.96",
  loginEndPoint: "/login/authenticate_Login_and_users",
  logoutEndPoint: "/login/logout",
  updateAgent: "/api/directory_search",
  setAgentStatus: "/Set-Agent-Status",
  getAgentStatus: "/Get-Agent-Status",
  agents: "/api/directory_search",
  queueName: "/api/api/queue_tests/1",
  customers: "/api/customers/",
  callInteractions: "/api/interactions/",
  port: ":5050",
};

export default userConfig;

//
// MAIN API
//
export const mainApi = axios.create({
  baseURL: dbConfig.baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

//
// KNOWLEDGE BASE API → DIRECT TO FLASK (NO PROXY LOGIC, ALWAYS WORKS)
//
const getKBBaseURL = (): string => {
  // STRAIGHT FIX: Always point directly to Flask backend on port 8083
  return "https://10.16.7.96:8083";
};

export const kbApi = axios.create({
  baseURL: getKBBaseURL(),                // → https://10.16.7.96:8083
  headers: { "Content-Type": "application/json" },
  withCredentials: true,                  // Keep this if Flask uses session cookies
  timeout: 90000,                         // 90 seconds for large file uploads
});

// Optional: you can even skip the function entirely and hardcode it directly:
// export const kbApi = axios.create({
//   baseURL: "https://10.16.7.96:8083",
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
//   timeout: 90000,
// });

//
// USER ROLES (unchanged – keep everything below exactly as you have it)
//

export enum UserRole {
  ADMIN = "admin",
  AGENT = "agent",
  UNKNOWN = "unknown"
}

//
// AUTH DATA INTERFACE
//
interface AuthData {
  user_id?: string;
  extension?: string;
  userId?: string;
  role?: string;
  username?: string;
  email?: string;
  fullName?: string;
  fullname?: string;
  firstname?: string;
  authenticated?: boolean;
}

let _cachedAuth: AuthData | null = null;

export const syncAuth = (): AuthData | null => {
  if (_cachedAuth) return _cachedAuth;

  const storages = [localStorage, sessionStorage];
  const keys = ['auth', 'user', 'session', 'userData', 'loginDetails'];

  for (const storage of storages) {
    for (const key of keys) {
      const raw = storage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.user_id || parsed.fullname || parsed.username || parsed.extension || parsed.role) {
            _cachedAuth = parsed;
            console.log(`Auth synced from ${storage === localStorage ? 'localStorage' : 'sessionStorage'}.${key}:`, parsed);
            const json = JSON.stringify(parsed);
            localStorage.setItem('auth', json);
            sessionStorage.setItem('auth', json);
            return parsed;
          }
        } catch (e) { /* ignore */ }
      }
    }
  }
  return null;
};

export const setAuthCookie = (loginData: any): AuthData => {
  const authData: AuthData = {
    user_id: loginData.user_id || loginData.fullname || loginData.username || loginData.firstname,
    extension: loginData.extension || '',
    userId: loginData.user_id || loginData.userId,
    role: loginData.role,
    username: loginData.username || loginData.user_id || loginData.fullname,
    email: loginData.email || '',
    fullName: loginData.fullName || loginData.fullname || loginData.username,
    firstname: loginData.firstname,
    authenticated: true,
  };
  const json = JSON.stringify(authData);
  localStorage.setItem('auth', json);
  sessionStorage.setItem('auth', json);
  _cachedAuth = authData;
  console.log('Auth saved to localStorage + sessionStorage:', authData);
  return authData;
};

export const getAuthData = (): AuthData | null => {
  return _cachedAuth || syncAuth();
};

export const getUserRole = (): UserRole => {
  const auth = getAuthData();
  if (!auth) return UserRole.UNKNOWN;
  const role = auth.role?.toLowerCase();
  if (role === "admin" || role === "administrator" || role === "supervisor") return UserRole.ADMIN;
  if (auth.extension || auth.user_id || auth.userId) return UserRole.AGENT;
  return UserRole.UNKNOWN;
};

export const getUserIdentifier = (): string | null => {
  const auth = getAuthData();
  if (!auth) return null;
  const role = getUserRole();
  if (role === UserRole.ADMIN) return auth.username || auth.email || auth.user_id || auth.fullname || "admin";
  if (role === UserRole.AGENT) return auth.extension || auth.user_id || auth.userId || null;
  return null;
};

export const isAdmin = (): boolean => getUserRole() === UserRole.ADMIN;
export const isAgent = (): boolean => getUserRole() === UserRole.AGENT;

let _isRedirecting = false;

const attachAuth = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    const auth = getAuthData();
    const userId = getUserIdentifier();
    if (auth && userId && config.headers) {
      config.headers.Authorization = `Bearer ${userId}`;
      config.headers["X-User-Role"] = getUserRole();
      console.log("Auth headers attached:", { userId, role: getUserRole() });
    } else {
      console.warn("No auth data for request:", config.url);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;

        if (currentPath.includes('/knowledge-base') || currentPath.includes('/kb')) {
          console.warn("401 in Knowledge Base → staying here, syncing auth...");
          syncAuth();
          return Promise.reject(error);
        }

        if (!_isRedirecting) {
          _isRedirecting = true;
          console.warn("Session expired. Redirecting to home...");
          localStorage.clear();
          sessionStorage.clear();
          _cachedAuth = null;
          setTimeout(() => {
            window.location.href = "/";
            _isRedirecting = false;
          }, 100);
        }
      }

      if (error.code === 'ERR_NETWORK') {
        console.error("Network error:", error.config?.baseURL);
      }

      return Promise.reject(error);
    }
  );
};

attachAuth(mainApi);
attachAuth(kbApi);

export const authUtils = {
  getAuthData,
  getUserRole,
  getUserIdentifier,
  isAdmin,
  isAgent,
  setAuthCookie,
  syncAuth,
};

export const uploadDocuments = async (files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  try {
    const response = await kbApi.post('/process-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    console.error('Upload failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload documents');
  }
};

export const getDocuments = async (): Promise<any> => {
  try {
    const response = await kbApi.get('/chat-documents');
    return response.data;
  } catch (error: any) {
    console.error('Get documents failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch documents');
  }
};

export const deleteDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await kbApi.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete document');
  }
};

export const reprocessDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await kbApi.post(`/reprocess-document/${documentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Reprocess failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to reprocess document');
  }
};

export const markDocumentAsGlobal = async (documentId: string): Promise<any> => {
  try {
    const response = await kbApi.post(`/documents/${documentId}/mark-global`);
    return response.data;
  } catch (error: any) {
    console.error('Mark global failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to mark document as global');
  }
};

export const unmarkDocumentAsGlobal = async (documentId: string): Promise<any> => {
  try {
    const response = await kbApi.post(`/documents/${documentId}/unmark-global`);
    return response.data;
  } catch (error: any) {
    console.error('Unmark global failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to unmark document as global');
  }
};

export const sendChatMessage = async (message: string, files?: File[]): Promise<any> => {
  const formData = new FormData();
  formData.append('message', message);
  if (files?.length) files.forEach(file => formData.append('files', file));
  try {
    const response = await kbApi.post('/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chat failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

export const healthCheck = async (): Promise<any> => {
  try {
    const response = await kbApi.get('/health');
    return response.data;
  } catch (error: any) {
    console.error('Health check failed:', error);
    throw new Error('Health check failed');
  }
};

export const knowledgeBaseApi = {
  uploadDocuments,
  getDocuments,
  deleteDocument,
  reprocessDocument,
  markDocumentAsGlobal,
  unmarkDocumentAsGlobal,
  sendChatMessage,
  healthCheck,
};

//
// KNOWLEDGE BASE MEMORY SESSION (SEPARATE FROM MAIN AUTH)
//
export const KBAuthSession = {
  userId: null as string | null,
  role: null as string | null,
  extension: null as string | null,

  syncFromMainAuth() {
    const stored = sessionStorage.getItem("loginDetails") || localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.userId = parsed.user_id || parsed.fullname || parsed.username || parsed.firstname || "admin";
        this.role = (parsed.role || "admin").toLowerCase();
        this.extension = parsed.extension || "";
        console.log("KB Session synced:", { userId: this.userId, role: this.role, extension: this.extension });
        return;
      } catch (e) {
        console.error("Failed to sync KB session:", e);
      }
    }
    this.userId = "admin";
    this.role = "admin";
    this.extension = "";
  },

  clear() {
    this.userId = null;
    this.role = null;
    this.extension = null;
    console.log("KB Session cleared");
  },

  isValid() {
    return !!this.userId && !!this.role;
  }
};

const attachKBOnlyAuth = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    if (!KBAuthSession.isValid()) {
      KBAuthSession.syncFromMainAuth();
    }

    if (KBAuthSession.isValid()) {
      config.headers["X-User-Id"] = KBAuthSession.userId;
      config.headers["X-User-Role"] = KBAuthSession.role;
      config.headers["X-Extension"] = KBAuthSession.extension || KBAuthSession.userId;

      console.log("KB Auth Headers Sent:", {
        "X-User-Id": KBAuthSession.userId,
        "X-User-Role": KBAuthSession.role,
        "X-Extension": KBAuthSession.extension || KBAuthSession.userId
      });
    } else {
      console.warn("KB Session invalid - headers not attached");
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        console.error("KB API 401 - re-syncing auth");
        KBAuthSession.syncFromMainAuth();
      }
      return Promise.reject(err);
    }
  );
};

attachKBOnlyAuth(kbApi);