"use client"

import { StudentRecord } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Printer } from "lucide-react"
import { getCategoryBadgeClasses, getCategoryTextColor } from "@/lib/grading"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StudentListProps {
  students: StudentRecord[];
  onDelete: (id: string) => void;
}

export function StudentList({ students, onDelete }: StudentListProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold">Registros de Alunos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex gap-2">
            <Printer className="h-4 w-4" /> Imprimir Relatório
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classificação</TableHead>
              <TableHead>Nome do Aluno</TableHead>
              <TableHead className="text-center">Acertos</TableHead>
              <TableHead className="text-center">Desempenho (%)</TableHead>
              <TableHead className="text-right no-print">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno registrado.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("font-bold text-[10px] py-0.5 px-2 uppercase border shadow-none", getCategoryBadgeClasses(student.category))}>
                        {student.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className={cn("text-center font-bold", getCategoryTextColor(student.category))}>
                    {student.score}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={cn("inline-flex items-center justify-center font-bold text-lg", getCategoryTextColor(student.category))}>
                      {student.percentage}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right no-print">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
    </div>
  );
}
