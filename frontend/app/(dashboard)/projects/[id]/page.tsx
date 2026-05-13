'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Users, Loader2, X, Calendar, Flag } from 'lucide-react';
import { useProject, useCreateTask, useUpdateTask, useDeleteTask, useUsers } from '@/hooks/use-queries';
import { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, STATUS_LABELS, PRIORITY_LABELS, PRIORITY_ICONS, formatDate, getInitials } from '@/lib/utils';
import Link from 'next/link';

const COLUMNS: Task['status'][] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const COLUMN_COLORS: Record<string, string> = {
  TODO: 'border-t-slate-500',
  IN_PROGRESS: 'border-t-blue-500',
  IN_REVIEW: 'border-t-yellow-500',
  DONE: 'border-t-green-500',
};
const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'bg-slate-500/20 text-slate-400',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
};

function TaskCard({ task, onStatusChange, onDelete }: {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="task-card group cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Priority + delete */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_BADGE[task.priority])}>
          {PRIORITY_ICONS[task.priority]} {PRIORITY_LABELS[task.priority]}
        </span>
        {hover && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm font-medium leading-snug mb-3">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" title={task.assignee.name}>
              {task.assignee.avatar
                ? <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                : getInitials(task.assignee.name)}
            </div>
          )}
          {task._count.comments > 0 && (
            <span className="text-xs text-muted-foreground">{task._count.comments} 💬</span>
          )}
        </div>
        {task.dueDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Status changer */}
      <div className="mt-3 pt-3 border-t border-border/50 flex gap-1 flex-wrap">
        {COLUMNS.filter(s => s !== task.status).map((s) => (
          <button key={s} onClick={() => onStatusChange(task.id, s)}
            className="text-[10px] text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-1.5 py-0.5 rounded transition-colors">
            → {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const { data: users } = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [addingTo, setAddingTo] = useState<Task['status'] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('MEDIUM');
  const [newAssignee, setNewAssignee] = useState('');

  const handleAddTask = async (status: Task['status']) => {
    if (!newTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTitle,
      priority: newPriority,
      assigneeId: newAssignee || undefined,
      projectId: id,
      status,
    });
    setNewTitle(''); setNewPriority('MEDIUM'); setNewAssignee('');
    setAddingTo(null);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask.mutate({ id: taskId, data: { status } });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!project) return <div className="text-center py-24 text-muted-foreground">Project not found</div>;

  const tasksByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = project.tasks?.filter(t => t.status === status) ?? [];
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: project.color + '22' }}>
              <div className="w-4 h-4 rounded-sm" style={{ background: project.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map(({ user }) => (
              <div key={user.id} title={user.name}
                className="w-7 h-7 rounded-full ring-2 ring-background overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground"><Users className="w-4 h-4 inline mr-1" />{project.members.length}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4 scrollbar-thin">
        {COLUMNS.map((status) => (
          <div key={status} className={cn('flex flex-col w-72 flex-shrink-0 glass rounded-xl border-t-2 p-4', COLUMN_COLORS[status])}>
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                  {tasksByStatus[status].length}
                </span>
              </div>
              <button
                id={`add-task-${status.toLowerCase()}`}
                onClick={() => setAddingTo(status)}
                className="w-6 h-6 rounded-md hover:bg-accent transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add task form */}
            {addingTo === status && (
              <div className="mb-3 p-3 glass rounded-lg border border-primary/30 animate-fade-in space-y-2">
                <Input
                  id="new-task-title"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask(status)}
                  autoFocus
                  className="text-sm h-8"
                />
                <div className="flex gap-2">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                    className="flex-1 text-xs bg-background border border-input rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="flex-1 text-xs bg-background border border-input rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map(({ user }) => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-1">
                  <Button id="save-task-btn" size="sm" variant="gradient" onClick={() => handleAddTask(status)}
                    disabled={!newTitle.trim() || createTask.isPending} className="h-7 text-xs flex-1">
                    {createTask.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="h-7 text-xs">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin min-h-[100px]">
              {tasksByStatus[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task as Task}
                  onStatusChange={handleStatusChange}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
              {tasksByStatus[status].length === 0 && addingTo !== status && (
                <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
