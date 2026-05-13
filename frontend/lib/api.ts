const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('taskflow_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, error.message || 'Request failed');
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<User>('/auth/me'),
};

// Users
export const usersApi = {
  list: () => request<User[]>('/users'),
  getStats: () => request<UserStats>('/users/me/stats'),
  getDashboard: () => request<DashboardStats>('/users/dashboard'),
};

// Projects
export const projectsApi = {
  list: () => request<Project[]>('/projects'),
  get: (id: string) => request<ProjectDetail>('/projects/' + id),
  create: (data: { name: string; description?: string; color?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    request<Project>('/projects/' + id, { method: 'PATCH', body: JSON.stringify(data) }),
  archive: (id: string) =>
    request('/projects/' + id + '/archive', { method: 'PATCH' }),
  delete: (id: string) =>
    request('/projects/' + id, { method: 'DELETE' }),
  addMember: (projectId: string, userId: string) =>
    request('/projects/' + projectId + '/members', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  removeMember: (projectId: string, memberId: string) =>
    request('/projects/' + projectId + '/members/' + memberId, { method: 'DELETE' }),
};

// Tasks
export const tasksApi = {
  list: (filters?: TaskFilters) => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return request<Task[]>('/tasks' + (params ? '?' + params : ''));
  },
  byProject: (projectId: string, filters?: TaskFilters) => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return request<Task[]>('/tasks/project/' + projectId + (params ? '?' + params : ''));
  },
  get: (id: string) => request<Task>('/tasks/' + id),
  create: (data: CreateTaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateTaskInput>) =>
    request<Task>('/tasks/' + id, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request('/tasks/' + id, { method: 'DELETE' }),
  addComment: (taskId: string, content: string) =>
    request('/tasks/' + taskId + '/comments', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (taskId: string, commentId: string) =>
    request('/tasks/' + taskId + '/comments/' + commentId, { method: 'DELETE' }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  avatar?: string;
  createdAt: string;
}

export interface UserStats {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: { status: string; _count: { status: number } }[];
  tasksByPriority: { priority: string; _count: { priority: number } }[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  members: { role: string; user: Pick<User, 'id' | 'name' | 'email' | 'avatar'> }[];
  _count: { tasks: number };
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  project: Pick<Project, 'id' | 'name' | 'color'>;
  assignee?: Pick<User, 'id' | 'name' | 'avatar'>;
  creator: Pick<User, 'id' | 'name' | 'avatar'>;
  comments: Comment[];
  _count: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  position?: number;
}
