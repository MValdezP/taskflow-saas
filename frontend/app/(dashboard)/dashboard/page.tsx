'use client';

import { CheckSquare, FolderKanban, Users, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useMyStats, useTasks } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { STATUS_LABELS, PRIORITY_LABELS, formatRelativeDate, cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-500', IN_PROGRESS: 'bg-blue-500', IN_REVIEW: 'bg-yellow-500', DONE: 'bg-green-500',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats } = useDashboardStats();
  const { data: myStats } = useMyStats();
  const { data: tasks } = useTasks();

  const recentTasks = tasks?.slice(0, 5) ?? [];
  const completionRate = myStats?.totalTasks
    ? Math.round((myStats.doneTasks / myStats.totalTasks) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Projects', value: stats?.totalProjects ?? '—', icon: FolderKanban,
      color: 'text-indigo-400', bg: 'bg-indigo-500/10',
    },
    {
      title: 'Total Tasks', value: stats?.totalTasks ?? '—', icon: CheckSquare,
      color: 'text-purple-400', bg: 'bg-purple-500/10',
    },
    {
      title: 'Team Members', value: stats?.totalUsers ?? '—', icon: Users,
      color: 'text-cyan-400', bg: 'bg-cyan-500/10',
    },
    {
      title: 'My Completion', value: `${completionRate}%`, icon: TrendingUp,
      color: 'text-green-400', bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Good morning, <span className="gradient-text">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="glass border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{s.title}</p>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.bg)}>
                  <s.icon className={cn('w-5 h-5', s.color)} />
                </div>
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution */}
        <Card className="glass border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.tasksByStatus.map((s) => {
              const total = stats.totalTasks || 1;
              const pct = Math.round((s._count.status / total) * 100);
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{STATUS_LABELS[s.status]}</span>
                    <span className="font-medium">{s._count.status} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', STATUS_COLORS[s.status])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!stats && <div className="text-sm text-muted-foreground">Loading stats...</div>}
          </CardContent>
        </Card>

        {/* My Stats */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base">My Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Total assigned', value: myStats?.totalTasks ?? 0, icon: CheckSquare, color: 'text-indigo-400' },
              { label: 'Done', value: myStats?.doneTasks ?? 0, icon: CheckCircle2, color: 'text-green-400' },
              { label: 'In progress', value: myStats?.inProgressTasks ?? 0, icon: Clock, color: 'text-blue-400' },
              { label: 'Overdue', value: myStats?.overdueTasks ?? 0, icon: AlertTriangle, color: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <item.icon className={cn('w-4 h-4', item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-lg leading-none mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Create your first project!</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_COLORS[task.status])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project.name}</p>
                  </div>
                  <Badge variant="outline" className={cn('text-xs', `priority-${task.priority.toLowerCase()}`)}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeDate(task.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
