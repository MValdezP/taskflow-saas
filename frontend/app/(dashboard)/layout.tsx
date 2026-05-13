'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, FolderKanban, CheckSquare, Users,
  LogOut, Settings, ChevronRight, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { cn, getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/team', label: 'Team', icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser().then(() => {
      const token = localStorage.getItem('taskflow_token');
      if (!token) router.push('/login');
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">TaskFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <Icon className={cn('w-4 h-4', active && 'text-primary')} />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border glass flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium capitalize">
              {pathname.split('/')[1] || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="text-sm">
              <span className="text-muted-foreground">Hello, </span>
              <span className="font-medium">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
