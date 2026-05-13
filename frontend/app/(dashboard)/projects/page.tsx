'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Users, CheckSquare, Archive, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn, formatRelativeDate, getInitials } from '@/lib/utils';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({ name, description, color });
    setName(''); setDescription(''); setColor('#6366f1');
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{projects?.length ?? 0} active projects</p>
        </div>
        <Button id="new-project-btn" variant="gradient" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass rounded-xl p-6 gradient-border animate-fade-in">
          <h2 className="font-semibold mb-4">New Project</h2>
          <form onSubmit={handleCreate} id="create-project-form" className="space-y-4">
            <Input id="project-name" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={cn('w-7 h-7 rounded-full border-2 transition-transform hover:scale-110', color === c ? 'border-white scale-110' : 'border-transparent')}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button id="create-project-submit" type="submit" variant="gradient" disabled={createProject.isPending}>
                {createProject.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Create Project
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {projects?.length === 0 ? (
        <div className="text-center py-24 glass rounded-2xl">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first project to get started</p>
          <Button variant="gradient" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Card key={project.id} className="glass border-border hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: project.color + '22' }}>
                      <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{project.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5 line-clamp-1">{project.description || 'No description'}</CardDescription>
                    </div>
                  </div>
                  <button onClick={() => deleteProject.mutate(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {project._count.tasks} tasks</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {project.members.length} members</span>
                </div>
                {/* Members avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map(({ user }) => (
                      <div key={user.id} title={user.name}
                        className="w-6 h-6 rounded-full ring-2 ring-background overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[9px] text-muted-foreground">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-primary hover:text-primary">
                      Open →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
