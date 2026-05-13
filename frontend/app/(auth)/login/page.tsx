'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    }
  };

  const fillDemo = () => {
    setEmail('alice@taskflow.dev');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md px-4 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">TaskFlow</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 gradient-border">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@taskflow.dev"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button id="login-submit" type="submit" className="w-full" variant="gradient" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign in
            </Button>
          </form>

          {/* Demo shortcut */}
          <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-center text-muted-foreground mb-2">Demo credentials</p>
            <Button
              id="fill-demo"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-indigo-400 hover:text-indigo-300"
              onClick={fillDemo}
            >
              Fill alice@taskflow.dev / password123
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
