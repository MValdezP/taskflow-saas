'use client';

import { useState } from 'react';
import { CheckSquare, Filter, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { useTasks, useUpdateTask } from '@/hooks/use-queries';
import { Task } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, STATUS_LABELS, PRIORITY_LABELS, formatDate, formatRelativeDate } from '@/lib/utils';

const STATUS_DOT: Record<string, string> = {
  TODO: 'bg-slate-400', IN_PROGRESS: 'bg-blue-400', IN_REVIEW: 'bg-yellow-400', DONE: 'bg-green-400',
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: tasks, isLoading } = useTasks({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const updateTask = useUpdateTask();

  const toggleDone = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      data: { status: task.status === 'DONE' ? 'TODO' : 'DONE' },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{tasks?.length ?? 0} tasks across all projects</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="task-search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="">All priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tasks?.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks?.map((task) => (
            <div key={task.id}
              className={cn(
                'flex items-center gap-4 p-4 glass rounded-xl hover:border-primary/30 transition-all duration-150 group',
                task.status === 'DONE' && 'opacity-60',
              )}>
              <button
                onClick={() => toggleDone(task)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  task.status === 'DONE'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-muted-foreground hover:border-primary',
                )}
              >
                {task.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', task.status === 'DONE' && 'line-through text-muted-foreground')}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{task.project.name}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[task.status])} />
                  <span className="text-xs text-muted-foreground hidden sm:block">{STATUS_LABELS[task.status]}</span>
                </div>
                <Badge variant="outline" className={cn('text-xs', `priority-${task.priority.toLowerCase()}`)}>
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                {task.assignee && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                    {task.assignee.avatar
                      ? <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                      : task.assignee.name[0]}
                  </div>
                )}
                <span className="text-xs text-muted-foreground hidden md:block">{formatRelativeDate(task.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
