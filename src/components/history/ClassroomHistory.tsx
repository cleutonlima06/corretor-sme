
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, ArrowRight, Calendar, BookOpen, School, Users } from "lucide-react"

interface ClassroomHistoryProps {
  classrooms: any[];
  onSelectClassroom: (classroom: any) => void;
}

export function ClassroomHistory({ classrooms, onSelectClassroom }: ClassroomHistoryProps) {
  const sortedClassrooms = useMemo(() => {
    return [...classrooms].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [classrooms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Histórico de Turmas Cadastradas</h2>
      </div>

      {sortedClassrooms.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            Nenhuma turma cadastrada foi encontrada. Comece configurando uma no Perfil.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClassrooms.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow border-primary/10 overflow-hidden group">
              <div className="h-1 bg-primary/20 w-full" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 text-[10px]">
                    <Users className="h-3 w-3" /> {cls.studentList?.length || 0} Alunos
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {cls.updatedAt ? new Date(cls.updatedAt).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {cls.classroomId}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <School className="h-3 w-3" /> {cls.schoolId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {cls.academicYear}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {cls.subjectId}
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="w-full gap-2 font-bold"
                    onClick={() => onSelectClassroom(cls)}
                  >
                    Abrir Turma <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
