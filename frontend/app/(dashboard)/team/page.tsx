'use client';

import { Users, Mail, Shield, CheckSquare, Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/use-queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatRelativeDate } from '@/lib/utils';

export default function TeamPage() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{users?.length ?? 0} members</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((user) => (
          <Card key={user.id} className="glass border-border hover:border-primary/30 transition-all hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      : getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" title="Online" />
                </div>

                <h3 className="font-semibold text-sm">{user.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" />{user.email}
                </p>

                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />{user.role}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Joined {formatRelativeDate(user.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
