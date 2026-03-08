import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentRecord } from "@/lib/types";
import { Users, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

export function SummaryCards({ students }: { students: StudentRecord[] }) {
  const totalStudents = students.length;
  const avgScore = totalStudents > 0 
    ? (students.reduce((acc, s) => acc + s.percentage, 0) / totalStudents).toFixed(1) 
    : 0;
  
  const categories = {
    CRÍTICO: students.filter(s => s.category === 'CRÍTICO').length,
    INTERMEDIÁRIO: students.filter(s => s.category === 'INTERMEDIÁRIO').length,
    ADEQUADO: students.filter(s => s.category === 'ADEQUADO').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgScore}%</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Adequado</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories.ADEQUADO}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Crítico</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories.CRÍTICO}</div>
        </CardContent>
      </Card>
    </div>
  );
}
