import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentRecord } from "@/lib/types";
import { Users, CheckCircle2, AlertCircle, BarChart3, HelpCircle, GraduationCap } from "lucide-react";

export function SummaryCards({ students }: { students: StudentRecord[] }) {
  const totalStudents = students.length;
  const avgScore = totalStudents > 0 
    ? (students.reduce((acc, s) => acc + s.percentage, 0) / totalStudents).toFixed(1) 
    : 0;
  
  const categories = {
    ABAIXO_BASICO: students.filter(s => s.category === 'ABAIXO DO BÁSICO').length,
    BASICO: students.filter(s => s.category === 'BÁSICO').length,
    PROFICIENTE: students.filter(s => s.category === 'PROFICIENTE').length,
    AVANCADO: students.filter(s => s.category === 'AVANÇADO').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Média</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{avgScore}%</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-green-600">Avançado</CardTitle>
          <GraduationCap className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{categories.AVANCADO}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-orange-600">Proficiente</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{categories.PROFICIENTE}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-yellow-600">Básico</CardTitle>
          <HelpCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{categories.BASICO}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-red-600">Abaixo Básico</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{categories.ABAIXO_BASICO}</div>
        </CardContent>
      </Card>
    </div>
  );
}
