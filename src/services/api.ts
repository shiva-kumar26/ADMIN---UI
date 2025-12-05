
import { LoginRequest, DirectoryUser, CreateUserRequest } from '@/types/api';

const API_BASE_URL = 'https://10.16.7.96';

export class ApiService {
  static async login(credentials: LoginRequest): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/authenticate_Login_and_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async getUsers(): Promise<DirectoryUser[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/directory_search/`);
      console.log('Status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async getUserById(id: number): Promise<DirectoryUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/directory-search/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<DirectoryUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/directory_search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<DirectoryUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/directory_search/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  static async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/directory_search/${id}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}
