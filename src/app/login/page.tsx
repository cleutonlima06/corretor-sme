'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, email, password)
        .catch((error: any) => {
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message || "Não foi possível criar sua conta."
          });
        });
    } else {
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
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "E-mail necessário",
        description: "Digite seu e-mail para receber o link de recuperação."
      });
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: "E-mail enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
      })
      .catch((error: any) => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar e-mail",
          description: error.message
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
            < GraduationCap className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Corretor SME Pro</CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie sua conta de professor para começar' : 'Acesse sua conta para gerenciar notas'}
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
            {!isSignUp && (
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                  onClick={handleForgotPassword}
                >
                  <KeyRound className="h-3 w-3 mr-1" /> Esqueci minha senha
                </Button>
              </div>
            )}
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
              {isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground hover:text-primary"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Ainda não tem conta? Cadastre-se agora'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
