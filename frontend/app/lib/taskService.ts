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

type LocalTask = {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  filled_quota: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  skills: string[];
  isEmergency: boolean;
  created_at?: string;
  updated_at?: string;
};

function readLocalTasks(): LocalTask[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
  } catch {
    return [];
  }
}

function writeLocalTasks(tasks: LocalTask[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toLocalTask(payload: CreateTaskPayload): LocalTask {
  const currentUser = typeof window === 'undefined' ? null : localStorage.getItem('user');
  let userId: number | undefined;

  if (currentUser) {
    try {
      const parsedUser = JSON.parse(currentUser);
      userId = Number(parsedUser?.id) || undefined;
    } catch {
      userId = undefined;
    }
  }

  return {
    id: Date.now(),
    user_id: userId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    district: payload.district,
    quota: payload.quota,
    filled_quota: 0,
    start_date: payload.start_date,
    end_date: payload.end_date,
    status: 'active',
    skills: payload.skills,
    isEmergency: !!payload.is_emergency,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
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
  is_emergency?: boolean;
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
    
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Session')) {
      throw new Error('Session expired. Please log in again.');
    }
    
    if (
      errorMsg.includes('500') ||
      errorMsg.includes('could not find driver') ||
      errorMsg.includes('Failed to connect') ||
      errorMsg.includes('localhost:8000')
    ) {
      const localTasks = readLocalTasks().map((task) => ({
        id: task.id,
        user_id: task.user_id || 0,
        title: task.title,
        description: task.description,
        category: task.category,
        district: task.district,
        quota: task.quota,
        filled_quota: task.filled_quota,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        skills: task.skills.map((skill_name) => ({ skill_name })),
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));

      console.warn('[TaskService] fetchNgoTasks fallback to local tasks:', errorMsg);
      return { data: localTasks };
    }

    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(payload: CreateTaskPayload): Promise<{ message: string; data: Task }> {
  try {
    return await apiPost('/ngo/tasks', payload);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);

    if (errorMsg.includes('500') || errorMsg.includes('could not find driver') || errorMsg.includes('Backend server is not responding')) {
      const localTask = toLocalTask(payload);
      const tasks = readLocalTasks();
      tasks.unshift(localTask);
      writeLocalTasks(tasks);

      return {
        message: 'Task created locally',
        data: {
          id: localTask.id,
          user_id: localTask.user_id || 0,
          title: localTask.title,
          description: localTask.description,
          category: localTask.category,
          district: localTask.district,
          quota: localTask.quota,
          filled_quota: localTask.filled_quota,
          start_date: localTask.start_date,
          end_date: localTask.end_date,
          status: localTask.status,
          skills: localTask.skills.map((skill_name) => ({ skill_name })),
          created_at: localTask.created_at,
          updated_at: localTask.updated_at,
        },
      };
    }

    throw error;
  }
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
