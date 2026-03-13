
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, ArrowRight, Users } from "lucide-react"

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClassrooms.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow border-primary/10 overflow-hidden group">
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
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full gap-2 font-bold"
                  onClick={() => onSelectClassroom(cls)}
                >
                  Abrir Turma <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
