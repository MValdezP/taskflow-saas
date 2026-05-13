'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md px-4 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">TaskFlow</span>
        </div>

        <div className="glass rounded-2xl p-8 gradient-border">
          <h1 className="text-2xl font-bold text-center mb-2">Create account</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Start managing tasks with your team
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reg-name">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Alice Johnson" className="pl-9" required minLength={2} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="pl-9" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="reg-password" type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="pl-9 pr-9" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button id="register-submit" type="submit" className="w-full" variant="gradient" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
