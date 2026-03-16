'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch((error: any) => {
        setLoading(false);
        let message = "Ocorreu um erro ao tentar entrar.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
          message = "E-mail ou senha incorretos. Por favor, tente novamente.";
        }
        toast({
          variant: "destructive",
          title: "Erro de acesso",
          description: message
        });
      });
  };

  if (isUserLoading || (user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">AvaLink Poranga</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar notas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full font-bold py-6 text-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Entrar no Sistema
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
              Gestão Poranga 2026
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
