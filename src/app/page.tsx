
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { PerformanceChart } from "@/components/dashboard/PerformanceChart"
import { AnswerKeyForm } from "@/components/grading/AnswerKeyForm"
import { StudentEntryForm } from "@/components/grading/StudentEntryForm"
import { StudentList } from "@/components/grading/StudentList"
import { StudentEditDialog } from "@/components/grading/StudentEditDialog"
import { ClassroomHistory } from "@/components/history/ClassroomHistory"
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel"
import { ProfessorProfileForm } from "@/components/profile/ProfessorProfileForm"
import { RankingAba } from "@/components/ranking/RankingAba"
import { StudentRecord } from "@/lib/types"
import { calculateScore, getPerformanceCategory } from "@/lib/grading"
import { LayoutDashboard, Settings, UserPlus, FileText, Sparkles, GraduationCap, LogOut, UserCircle, Loader2, Search, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function SMEProDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editingAnswerKey, setEditingAnswerKey] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'professorProfile', user.uid) : null, [user, db]);
  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  const studentsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'students'), orderBy('createdAt', 'desc')) : null, [user, db]);
  const { data: allStudentsData, isLoading: isStudentsLoading } = useCollection<StudentRecord>(studentsQuery);

  const classroomsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'classrooms'), orderBy('updatedAt', 'desc')) : null, [user, db]);
  const { data: classroomsData, isLoading: isClassroomsLoading } = useCollection(classroomsQuery);

  const currentClassroomStudents = useMemo(() => {
    if (!profileData || !allStudentsData) return [];
    return allStudentsData
      .filter(s => 
        s.schoolId === profileData.schoolId && 
        s.classroomId === profileData.classroomId && 
        s.academicYear === profileData.academicYear?.toString() && 
        s.subjectId === profileData.subjectId
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [allStudentsData, profileData]);

  const existingStudentNames = useMemo(() => {
    return currentClassroomStudents.map(s => s.name);
  }, [currentClassroomStudents]);

  const recentStudents = useMemo(() => {
    if (!profileData || !allStudentsData) return [];
    return allStudentsData
      .filter(s => 
        s.schoolId === profileData.schoolId && 
        s.classroomId === profileData.classroomId && 
        s.academicYear === profileData.academicYear?.toString() && 
        s.subjectId === profileData.subjectId
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 5);
  }, [allStudentsData, profileData]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const answerKey = profileData?.answerKey || Array(10).fill("");

  const handleSaveAnswerKey = (newKey: string[]) => {
    if (!user || !profileRef) return;
    
    setDocumentNonBlocking(profileRef, { 
      answerKey: newKey,
      updatedAt: new Date().toISOString() 
    }, { merge: true });

    if (profileData?.schoolId && profileData?.classroomId) {
      const classId = `${profileData.schoolId}-${profileData.classroomId}-${profileData.academicYear}-${profileData.subjectId}`.replace(/\s+/g, '_');
      const classRef = doc(db, 'users', user.uid, 'classrooms', classId);
      setDocumentNonBlocking(classRef, {
        answerKey: newKey,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    toast({
      title: "Gabarito salvo",
      description: "As respostas oficiais foram atualizadas com sucesso.",
    });
  };

  const handleAddStudent = (name: string, answers: string[]) => {
    if (!user || !profileData || !profileData.classroomId) {
      toast({
        variant: "destructive",
        title: "Turma não configurada",
        description: "Defina os dados da turma no perfil antes de lançar notas."
      });
      setActiveTab("profile");
      return;
    }
    const score = calculateScore(answers, answerKey);
    const percentage = Math.round((score / answerKey.length) * 100);
    
    const studentData = {
      name,
      answers,
      score,
      percentage,
      category: getPerformanceCategory(percentage),
      createdAt: Date.now(),
      professorId: user.uid,
      schoolId: profileData.schoolId,
      classroomId: profileData.classroomId,
      academicYear: profileData.academicYear?.toString(),
      subjectId: profileData.subjectId
    };
    
    const colRef = collection(db, 'users', user.uid, 'students');
    addDocumentNonBlocking(colRef, studentData);
  };

  const handleDeleteStudent = (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'students', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleUpdateStudent = (id: string, name: string, answers: string[], score: number, percentage: number, category: any) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'students', id);
    updateDocumentNonBlocking(docRef, {
      name,
      answers,
      score,
      percentage,
      category,
      updatedAt: Date.now()
    });
    toast({
      title: "Registro atualizado",
      description: `Os dados de ${name} foram salvos.`
    });
  };

  const handleClearAllStudents = () => {
    if (!user || currentClassroomStudents.length === 0) return;
    
    currentClassroomStudents.forEach((student) => {
      const docRef = doc(db, 'users', user.uid, 'students', student.id);
      deleteDocumentNonBlocking(docRef);
    });

    toast({
      title: "Dados limpos",
      description: "Todos os registros desta turma foram removidos.",
    });
  };

  const handleSelectClassroom = (cls: any) => {
    if (!user || !profileRef) return;
    
    setDocumentNonBlocking(profileRef, {
      schoolId: cls.schoolId,
      classroomId: cls.classroomId,
      academicYear: cls.academicYear,
      subjectId: cls.subjectId,
      studentList: cls.studentList || [],
      answerKey: cls.answerKey || Array(10).fill(""),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: "Turma Selecionada",
      description: `A lista de ${cls.studentList?.length || 0} alunos e o gabarito foram carregados.`
    });
    
    setActiveTab("input");
  };

  const handleOpenEdit = (student: StudentRecord, customKey?: string[]) => {
    setEditingStudent(student);
    setEditingAnswerKey(customKey || answerKey);
  };

  const handleLogout = () => {
    auth.signOut().then(() => router.push('/login'));
  };

  if (isUserLoading || !user) return null;

  if (isProfileLoading || isStudentsLoading || isClassroomsLoading) {
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
              < GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Corretor SME Pro</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/80 text-xs font-light mt-1">
                {profileData && profileData.schoolId && profileData.classroomId ? (
                  <>
                    <span>{profileData.schoolId}</span>
                    <span className="hidden md:inline">|</span>
                    <span>Turma: {profileData.classroomId}</span>
                    <span className="hidden md:inline">|</span>
                    <span>Ano: {profileData.academicYear}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{profileData.subjectId}</span>
                  </>
                ) : (
                  <span>Aguardando configuração de nova turma</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center md:justify-start no-print overflow-x-auto pb-2">
            <TabsList className="bg-white border shadow-sm p-1 rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="ranking" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Trophy className="h-4 w-4" /> Classificação
              </TabsTrigger>
              <TabsTrigger value="input" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <UserPlus className="h-4 w-4" /> Lançar Notas
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4" /> Relatório
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Search className="h-4 w-4" /> Consultar Turmas
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
            <div className="no-print">
              <SummaryCards students={currentClassroomStudents} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 no-print">
                <AIInsightsPanel answerKey={answerKey} students={currentClassroomStudents} />
                <StudentList 
                  students={recentStudents} 
                  title="Últimos lançamentos" 
                  showPrint={false} 
                  answerKey={answerKey}
                />
              </div>
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm print-full-width">
                  <div className="flex items-center justify-between mb-4 no-print">
                    <h3 className="font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Distribuição de Desempenho
                    </h3>
                  </div>
                  <PerformanceChart students={currentClassroomStudents} profileData={profileData} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="outline-none">
            <RankingAba students={allStudentsData || []} />
          </TabsContent>

          <TabsContent value="input" className="outline-none">
            <div className="max-w-5xl mx-auto space-y-8">
              <StudentEntryForm 
                questionCount={answerKey.length || 10} 
                onAdd={handleAddStudent}
                registeredNames={profileData?.studentList || []}
                existingRecords={existingStudentNames}
              />
            </div>
          </TabsContent>

          <TabsContent value="students" className="outline-none">
            <StudentList 
              students={currentClassroomStudents} 
              onClearAll={handleClearAllStudents}
              title="Relatório da Turma Ativa" 
              showPrint={true} 
              profileData={profileData}
              answerKey={answerKey}
            />
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <ClassroomHistory 
              classrooms={classroomsData || []} 
              allStudents={allStudentsData || []}
              onDeleteStudent={handleDeleteStudent}
              onEditStudent={handleOpenEdit}
              onSelectClassroom={handleSelectClassroom} 
            />
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-4xl mx-auto">
              <AnswerKeyForm currentKey={answerKey} onSave={handleSaveAnswerKey} />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <div className="max-w-4xl mx-auto">
              <ProfessorProfileForm userId={user.uid} initialData={profileData} />
            </div>
          </TabsContent>
        </Tabs>

        <StudentEditDialog 
          student={editingStudent} 
          isOpen={!!editingStudent} 
          onClose={() => { setEditingStudent(null); setEditingAnswerKey(null); }} 
          onSave={handleUpdateStudent}
          answerKey={editingAnswerKey || answerKey}
        />
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t py-2 px-8 text-center text-xs text-muted-foreground no-print">
        Sistema Corretor SME Pro &copy; {currentYear > 0 ? currentYear : ''} - Gestão educacional simplificada.
      </footer>
    </div>
  );
}
