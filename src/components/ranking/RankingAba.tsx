"use client"

import { useMemo } from "react"
import { StudentRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Users, Target, Award, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryBadgeClasses, getCategoryTextColor } from "@/lib/grading"

interface RankingAbaProps {
  students: StudentRecord[];
}

export function RankingAba({ students }: RankingAbaProps) {
  const rankingData = useMemo(() => {
    // 1. Agrupar por Turma
    const classroomGroups: Record<string, {
      id: string;
      name: string;
      school: string;
      year: string;
      subject: string;
      totalPercentage: number;
      count: number;
    }> = {};

    students.forEach(s => {
      if (!s.classroomId) return;
      const key = `${s.schoolId}-${s.classroomId}-${s.academicYear}-${s.subjectId}`;
      if (!classroomGroups[key]) {
        classroomGroups[key] = {
          id: key,
          name: s.classroomId,
          school: s.schoolId || "",
          year: s.academicYear || "",
          subject: s.subjectId || "",
          totalPercentage: 0,
          count: 0
        };
      }
      classroomGroups[key].totalPercentage += s.percentage;
      classroomGroups[key].count++;
    });

    const classroomAverages = Object.values(classroomGroups).map(g => ({
      ...g,
      average: Math.round(g.totalPercentage / g.count)
    })).sort((a, b) => b.average - a.average);

    // 2. Turmas Destaque
    const top3Classrooms = classroomAverages.slice(0, 3);
    const bottom3Classrooms = [...classroomAverages].sort((a, b) => a.average - b.average).slice(0, 3);

    // 3. Ranking Avançado
    const advancedRanking = students
      .filter(s => s.category === 'AVANÇADO')
      .sort((a, b) => b.percentage - a.percentage);

    // 4. Menores Resultados
    const bottom5Results = [...students]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);

    // 5. Resumo Global
    const globalStats = {
      total: students.length,
      abaixo: students.filter(s => s.category === 'ABAIXO DO BÁSICO').length,
      basico: students.filter(s => s.category === 'BÁSICO').length,
      proficiente: students.filter(s => s.category === 'PROFICIENTE').length,
      avancado: students.filter(s => s.category === 'AVANÇADO').length,
    };

    return { top3Classrooms, bottom3Classrooms, advancedRanking, bottom5Results, globalStats };
  }, [students]);

  const { top3Classrooms, bottom3Classrooms, advancedRanking, bottom5Results, globalStats } = rankingData;

  return (
    <div className="space-y-8 pb-10">
      {/* Quadro de Resumo Global */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Alunos Avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{globalStats.total}</div>
            <p className="text-[10px] opacity-80 mt-1 text-white/80 uppercase font-medium">Todas as turmas</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-green-600 font-bold uppercase">Avançado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.avancado}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-orange-600 font-bold uppercase">Proficiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.proficiente}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-yellow-600 font-bold uppercase">Básico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.basico}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-red-600 font-bold uppercase">Abaixo do Básico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.abaixo}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 3 Turmas */}
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="bg-green-50/50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5" /> Top 3 - Maior Desempenho (Turmas)
            </CardTitle>
            <CardDescription>Turmas com as maiores médias de acertos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {top3Classrooms.length > 0 ? top3Classrooms.map((cls, idx) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", 
                      idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                      idx === 1 ? "bg-slate-100 text-slate-700" : "bg-orange-100 text-orange-700")}>
                      {idx + 1}º
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{cls.school} • {cls.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{cls.average}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{cls.count} alunos</p>
                  </div>
                </div>
              )) : <p className="text-center py-4 text-muted-foreground italic text-sm">Dados insuficientes.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Bottom 3 Turmas */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="h-5 w-5" /> Menor Desempenho (Turmas)
            </CardTitle>
            <CardDescription>Turmas que necessitam de maior acompanhamento pedagógico.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {bottom3Classrooms.length > 0 ? bottom3Classrooms.map((cls, idx) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-red-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                      !
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{cls.school} • {cls.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">{cls.average}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{cls.count} alunos</p>
                  </div>
                </div>
              )) : <p className="text-center py-4 text-muted-foreground italic text-sm">Dados insuficientes.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ranking Avançado - Todos os Alunos */}
        <Card className="lg:col-span-2 shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" /> Ranking: Alunos de Nível Avançado
            </CardTitle>
            <CardDescription>Lista completa de alunos que atingiram excelência.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Pos.</TableHead>
                    <TableHead>Nome do Aluno</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead className="text-right">Desempenho</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancedRanking.length > 0 ? advancedRanking.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-center font-bold text-muted-foreground">{idx + 1}º</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-[10px] uppercase font-medium">{s.classroomId}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{s.percentage}%</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic text-sm">
                        Nenhum aluno atingiu o nível avançado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 5 Menores Resultados Individuais */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertCircle className="h-4 w-4" /> Alerta: Menores Resultados
            </CardTitle>
            <CardDescription className="text-[10px]">Os 5 resultados individuais mais baixos na rede.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {bottom5Results.length > 0 ? bottom5Results.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-3 border-b border-dashed last:border-0">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">{s.classroomId} • {s.subjectId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-600">{s.percentage}%</p>
                    <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 bg-red-50 text-red-700 border-red-200">
                      CRÍTICO
                    </Badge>
                  </div>
                </div>
              )) : <p className="text-center text-muted-foreground py-4 text-xs italic">Sem registros.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
