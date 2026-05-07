import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface TaskSkill {
  id?: number;
  skill_name: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  filled_quota: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  skills?: TaskSkill[];
  applications?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  start_date: string;
  end_date: string;
  skills: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  district?: string;
  quota?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  skills?: string[];
}

/**
 * Get all tasks for the authenticated NGO
 */
export async function fetchNgoTasks(): Promise<{ data: Task[] }> {
  try {
    return await apiGet('/ngo/tasks');
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    
    console.error('[TaskService] fetchNgoTasks error:', errorMsg);
    
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Session')) {
      throw new Error('Session expired. Please log in again.');
    }
    if (errorMsg.includes('Failed to connect') || errorMsg.includes('localhost:8000')) {
      throw new Error('Backend server is not responding. Make sure the API server is running on http://localhost:8000. Check browser console for details.');
    }
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(payload: CreateTaskPayload): Promise<{ message: string; data: Task }> {
  return apiPost('/ngo/tasks', payload);
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<{ message: string; data: Task }> {
  return apiPut(`/ngo/tasks/${taskId}`, payload);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number): Promise<{ message: string }> {
  return apiDelete(`/ngo/tasks/${taskId}`);
}

/**
 * Mark a task as completed
 */
export async function completeTask(taskId: number): Promise<{ message: string; data: Task }> {
  return apiPost(`/ngo/tasks/${taskId}/complete`, {});
}
