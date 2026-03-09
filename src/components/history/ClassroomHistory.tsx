"use client"

import { useMemo } from "react"
import { StudentRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, ArrowRight, Calendar, BookOpen, School } from "lucide-react"

interface ClassroomHistoryProps {
  students: StudentRecord[];
  onSelectClassroom: (classroom: any) => void;
}

export function ClassroomHistory({ students, onSelectClassroom }: ClassroomHistoryProps) {
  const classrooms = useMemo(() => {
    const groups: Record<string, {
      id: string;
      schoolId: string;
      classroomId: string;
      academicYear: string;
      subjectId: string;
      studentCount: number;
      avgPerformance: number;
      lastUpdate: number;
    }> = {};

    students.forEach(s => {
      if (!s.classroomId) return;
      const key = `${s.schoolId}-${s.classroomId}-${s.academicYear}-${s.subjectId}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          schoolId: s.schoolId || "",
          classroomId: s.classroomId || "",
          academicYear: s.academicYear || "",
          subjectId: s.subjectId || "",
          studentCount: 0,
          avgPerformance: 0,
          lastUpdate: s.createdAt
        };
      }
      groups[key].studentCount++;
      groups[key].avgPerformance += s.percentage;
      if (s.createdAt > groups[key].lastUpdate) groups[key].lastUpdate = s.createdAt;
    });

    return Object.values(groups).map(g => ({
      ...g,
      avgPerformance: Math.round(g.avgPerformance / g.studentCount)
    })).sort((a, b) => b.lastUpdate - a.lastUpdate);
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Consultar Histórico de Turmas</h2>
      </div>

      {classrooms.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            Nenhuma turma com lançamentos concluídos foi encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow border-primary/10 overflow-hidden group">
              <div className="h-2 bg-primary/20 w-full" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {cls.studentCount} Alunos
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(cls.lastUpdate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  {cls.classroomId}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <School className="h-3 w-3" /> {cls.schoolId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {cls.academicYear}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> {cls.subjectId}
                  </div>
                </div>
                
                <div className="pt-2 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Desempenho Médio</p>
                    <p className="text-xl font-bold text-primary">{cls.avgPerformance}%</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="group-hover:bg-primary group-hover:text-white transition-colors"
                    onClick={() => onSelectClassroom(cls)}
                  >
                    Abrir <ArrowRight className="ml-2 h-4 w-4" />
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
