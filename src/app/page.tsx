"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
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
import { LayoutDashboard, Settings, UserPlus, FileText, Sparkles, GraduationCap, LogOut, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SMEProDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [answerKey, setAnswerKey] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Perfil do Professor vindo do Firestore
  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'professorProfile', user.uid) : null, [user, db]);
  const { data: profileData } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Persistence with LocalStorage
    const savedKey = localStorage.getItem('sme_answer_key');
    const savedStudents = localStorage.getItem('sme_students');
    
    if (savedKey) setAnswerKey(JSON.parse(savedKey));
    else setAnswerKey(Array(10).fill(""));

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sme_answer_key', JSON.stringify(answerKey));
      localStorage.setItem('sme_students', JSON.stringify(students));
    }
  }, [answerKey, students, isHydrated]);

  const handleSaveAnswerKey = (newKey: string[]) => {
    setAnswerKey(newKey);
    const updatedStudents = students.map(student => {
      const score = calculateScore(student.answers, newKey);
      const percentage = Math.round((score / newKey.length) * 100);
      return {
        ...student,
        score,
        percentage,
        category: getPerformanceCategory(percentage)
      };
    });
    setStudents(updatedStudents);
  };

  const handleAddStudent = (name: string, answers: string[]) => {
    const score = calculateScore(answers, answerKey);
    const percentage = Math.round((score / answerKey.length) * 100);
    const newStudent: StudentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      answers,
      score,
      percentage,
      category: getPerformanceCategory(percentage),
      createdAt: Date.now()
    };
    setStudents([newStudent, ...students]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleLogout = () => {
    auth.signOut().then(() => router.push('/login'));
  };

  if (isUserLoading || !user || !isHydrated) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4 md:px-8 mb-8 no-print shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Corretor SME Pro</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/80 text-xs font-light mt-1">
                {profileData ? (
                  <>
                    <span>{profileData.schoolId || 'Escola não definida'}</span>
                    <span className="hidden md:inline">|</span>
                    <span>Turma: {profileData.classroomId || '-'}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{profileData.academicYear || '-'}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{profileData.subjectId || '-'}</span>
                  </>
                ) : (
                  <span>Configure seu perfil para começar</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm font-medium">{user.email || 'Visitante'}</span>
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
              <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <UserCircle className="h-4 w-4" /> Perfil
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="h-4 w-4" /> Gabarito
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
              <StudentEntryForm questionCount={answerKey.length} onAdd={handleAddStudent} />
            </div>
          </TabsContent>

          <TabsContent value="students" className="outline-none">
            <StudentList students={students} onDelete={handleDeleteStudent} />
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <div className="max-w-3xl mx-auto">
              <ProfessorProfileForm userId={user.uid} initialData={profileData} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-4xl mx-auto">
              <AnswerKeyForm currentKey={answerKey} onSave={handleSaveAnswerKey} />
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
