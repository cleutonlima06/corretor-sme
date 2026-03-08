"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { PerformanceChart } from "@/components/dashboard/PerformanceChart"
import { AnswerKeyForm } from "@/components/grading/AnswerKeyForm"
import { StudentEntryForm } from "@/components/grading/StudentEntryForm"
import { StudentList } from "@/components/grading/StudentList"
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel"
import { ProfessorProfileForm } from "@/components/profile/ProfessorProfileForm"
import { StudentRecord } from "@/lib/types"
import { calculateScore, getPerformanceCategory } from "@/lib/grading"
import { LayoutDashboard, Settings, UserPlus, FileText, Sparkles, GraduationCap, LogOut, UserCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SMEProDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  // Perfil do Professor e Configurações (inclui Gabarito)
  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'professorProfile', user.uid) : null, [user, db]);
  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  // Lista de Alunos do Firestore
  const studentsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'students'), orderBy('createdAt', 'desc')) : null, [user, db]);
  const { data: studentsData, isLoading: isStudentsLoading } = useCollection<StudentRecord>(studentsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const answerKey = profileData?.answerKey || Array(10).fill("");
  const students = studentsData || [];

  const handleSaveAnswerKey = (newKey: string[]) => {
    if (!user || !profileRef) return;
    setDocumentNonBlocking(profileRef, { 
      answerKey: newKey,
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  };

  const handleAddStudent = (name: string, answers: string[]) => {
    if (!user) return;
    const score = calculateScore(answers, answerKey);
    const percentage = Math.round((score / answerKey.length) * 100);
    
    const studentData = {
      name,
      answers,
      score,
      percentage,
      category: getPerformanceCategory(percentage),
      createdAt: Date.now(),
      professorId: user.uid
    };
    
    const colRef = collection(db, 'users', user.uid, 'students');
    addDocumentNonBlocking(colRef, studentData);
  };

  const handleDeleteStudent = (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'students', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleLogout = () => {
    auth.signOut().then(() => router.push('/login'));
  };

  if (isUserLoading || !user) return null;

  if (isProfileLoading || isStudentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-primary text-white py-6 px-4 md:px-8 mb-8 no-print shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Corretor SME Pro</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/80 text-xs font-light mt-1">
                {profileData && profileData.schoolId ? (
                  <>
                    <span>{profileData.schoolId}</span>
                    <span className="hidden md:inline">|</span>
                    <span>Turma: {profileData.classroomId || '-'}</span>
                    <span className="hidden md:inline">|</span>
                    <span>Ano: {profileData.academicYear || '-'}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{profileData.subjectId || '-'}</span>
                  </>
                ) : (
                  <span>Configure seu perfil na aba Perfil</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm font-medium">{user.email || 'Professor'}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex justify-center md:justify-start no-print overflow-x-auto pb-2">
            <TabsList className="bg-white border shadow-sm p-1 rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="input" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <UserPlus className="h-4 w-4" /> Lançar Notas
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4" /> Relatório
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="h-4 w-4" /> Gabarito
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <UserCircle className="h-4 w-4" /> Perfil
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8 outline-none">
            <SummaryCards students={students} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <AIInsightsPanel answerKey={answerKey} students={students} />
                <StudentList students={students.slice(0, 5)} onDelete={handleDeleteStudent} />
              </div>
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Distribuição de Desempenho
                  </h3>
                  <PerformanceChart students={students} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="input" className="outline-none">
            <div className="max-w-3xl mx-auto">
              <StudentEntryForm questionCount={answerKey.length || 10} onAdd={handleAddStudent} />
            </div>
          </TabsContent>

          <TabsContent value="students" className="outline-none">
            <StudentList students={students} onDelete={handleDeleteStudent} />
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-4xl mx-auto">
              <AnswerKeyForm currentKey={answerKey} onSave={handleSaveAnswerKey} />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <div className="max-w-3xl mx-auto">
              <ProfessorProfileForm userId={user.uid} initialData={profileData} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t py-2 px-8 text-center text-xs text-muted-foreground no-print">
        Sistema Corretor SME Pro &copy; {new Date().getFullYear()} - Otimizado para gestão escolar moderna.
      </footer>
    </div>
  );
}
