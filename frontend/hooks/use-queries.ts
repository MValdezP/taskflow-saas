import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi, usersApi, TaskFilters, CreateTaskInput } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

// ─── Projects ───────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project created ✓', description: 'Your new project is ready.' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', id] });
      toast({ title: 'Project updated ✓' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project deleted' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
  });
}

export function useProjectTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', 'project', projectId, filters],
    queryFn: () => tasksApi.byProject(projectId, filters),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects', task.project.id] });
      toast({ title: 'Task created ✓' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskInput> }) =>
      tasksApi.update(id, data),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', task.id] });
      qc.invalidateQueries({ queryKey: ['projects', task.project.id] });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Task deleted' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.addComment(taskId, content),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: ['users', 'me', 'stats'],
    queryFn: usersApi.getStats,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: usersApi.getDashboard,
  });
}
