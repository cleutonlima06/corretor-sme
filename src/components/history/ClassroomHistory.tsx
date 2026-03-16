
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, ArrowRight, Users, ChevronLeft } from "lucide-react"
import { StudentList } from "@/components/grading/StudentList"
import { StudentRecord } from "@/lib/types"

interface ClassroomHistoryProps {
  classrooms: any[];
  allStudents: StudentRecord[];
  onDeleteStudent: (id: string) => void;
  onEditStudent: (student: StudentRecord, answerKey?: string[]) => void;
  onSelectClassroom: (classroom: any) => void;
}

export function ClassroomHistory({ 
  classrooms, 
  allStudents, 
  onDeleteStudent, 
  onEditStudent,
  onSelectClassroom 
}: ClassroomHistoryProps) {
  const [viewingClassroom, setViewingClassroom] = useState<any | null>(null);

  const sortedClassrooms = useMemo(() => {
    return [...classrooms].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [classrooms]);

  const classroomStudents = useMemo(() => {
    if (!viewingClassroom) return [];
    return allStudents.filter(s => 
      s.schoolId === viewingClassroom.schoolId && 
      s.classroomId === viewingClassroom.classroomId && 
      s.academicYear === viewingClassroom.academicYear?.toString() && 
      s.subjectId === viewingClassroom.subjectId
    ).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [allStudents, viewingClassroom]);

  if (viewingClassroom) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setViewingClassroom(null)} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Voltar ao Histórico
          </Button>
          <div className="text-right">
            <h3 className="font-bold text-primary">{viewingClassroom.classroomId}</h3>
            <p className="text-[10px] text-muted-foreground uppercase">{viewingClassroom.schoolId} • {viewingClassroom.subjectId}</p>
          </div>
        </div>

        <StudentList 
          students={classroomStudents} 
          onDelete={onDeleteStudent}
          onEdit={onEditStudent}
          title="Alunos e Lançamentos"
          showPrint={false}
          profileData={viewingClassroom}
          answerKey={viewingClassroom.answerKey}
          requireConfirmDelete={true} // Habilita a confirmação de exclusão
        />
        
        <div className="pt-4 border-t border-dashed">
          <Button variant="outline" className="w-full gap-2" onClick={() => onSelectClassroom(viewingClassroom)}>
            <ArrowRight className="h-4 w-4" /> Abrir Turma para Novos Lançamentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Histórico de Turmas</h2>
      </div>

      {sortedClassrooms.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            Nenhuma turma cadastrada foi encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClassrooms.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow border-primary/10 overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 text-[10px]">
                    <Users className="h-3 w-3" /> {cls.studentList?.length || 0} Nomes
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {cls.updatedAt ? new Date(cls.updatedAt).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>
                <CardTitle className="text-base flex items-center gap-2">
                  < GraduationCap className="h-4 w-4 text-primary" />
                  {cls.classroomId}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground uppercase truncate">{cls.schoolId} • {cls.subjectId}</p>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="w-full gap-2 font-bold"
                  onClick={() => setViewingClassroom(cls)}
                >
                  Ver Alunos e Notas <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
