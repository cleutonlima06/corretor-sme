
"use client"

import { useState, useEffect } from "react"
import { StudentRecord } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Printer, GraduationCap, School } from "lucide-react"
import { getCategoryBadgeClasses, getCategoryTextColor } from "@/lib/grading"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StudentListProps {
  students: StudentRecord[];
  onDelete: (id: string) => void;
  title?: string;
  showPrint?: boolean;
  profileData?: any;
}

export function StudentList({ students, onDelete, title = "Últimos lançamentos", showPrint = true, profileData }: StudentListProps) {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('pt-BR'));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho exclusivo para impressão */}
      <div className="hidden print:block mb-8 border-b-2 border-primary/20 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-6 w-6" />
              <h1 className="text-2xl font-bold tracking-tight">Corretor SME Pro</h1>
            </div>
            <p className="text-muted-foreground text-sm italic">Relatório Oficial de Desempenho - Gerado em {currentDate}</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-lg font-bold flex items-center justify-end gap-2 text-primary">
              <School className="h-4 w-4" /> {profileData?.schoolId || 'Escola não informada'}
            </h2>
            <div className="text-sm text-muted-foreground flex flex-col items-end">
              <span className="flex items-center gap-1">Turma: {profileData?.classroomId || '-'}</span>
              <span className="flex items-center gap-1">Ano Letivo: {profileData?.academicYear || '-'}</span>
              <span className="flex items-center gap-1">Disciplina: {profileData?.subjectId || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold">{title}</h2>
        {showPrint && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex gap-2 border-primary/20 hover:bg-primary/5">
              <Printer className="h-4 w-4" /> Imprimir Relatório
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden print:shadow-none print:border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50 print:bg-slate-100">
            <TableRow>
              <TableHead className="w-[120px]">Classificação</TableHead>
              <TableHead>Nome do Aluno</TableHead>
              <TableHead className="text-center">Acertos</TableHead>
              <TableHead className="text-center">Desempenho (%)</TableHead>
              <TableHead className="text-right no-print w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                  Nenhum registro encontrado para esta turma.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <Badge className={cn("font-bold text-[10px] py-0.5 px-2 uppercase border shadow-none whitespace-nowrap", getCategoryBadgeClasses(student.category))}>
                      {student.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-bold", getCategoryTextColor(student.category))}>
                      {student.score}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-bold text-lg", getCategoryTextColor(student.category))}>
                      {student.percentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right no-print">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => onDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-muted-foreground">
        Documento gerado pelo sistema Corretor SME Pro. A avaliação de desempenho segue as diretrizes pedagógicas vigentes.
      </div>
    </div>
  );
}
