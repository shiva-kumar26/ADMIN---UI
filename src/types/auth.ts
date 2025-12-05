export interface User {
  agents: any;
  user_id: string;
  status: string;
  state: string;
  extension?: string;
  firstname: string;
  lastname: string;
  hostname?: string;
  fullname?: string;
  supervisor_reference?: string;
  role: 'Admin' | 'Agent' | 'Supervisor';
  authenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
