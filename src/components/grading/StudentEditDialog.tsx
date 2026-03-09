"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StudentRecord } from "@/lib/types"
import { calculateScore, getPerformanceCategory } from "@/lib/grading"

interface StudentEditDialogProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, answers: string[], score: number, percentage: number, category: any) => void;
  answerKey: string[];
}

export function StudentEditDialog({ student, isOpen, onClose, onSave, answerKey }: StudentEditDialogProps) {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setAnswers(student.answers);
    }
  }, [student]);

  const handleUpdateAnswer = (index: number, value: string) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value.toUpperCase();
    setAnswers(nextAnswers);
  };

  const handleSave = () => {
    if (!student || !name.trim()) return;
    
    const score = calculateScore(answers, answerKey);
    const percentage = Math.round((score / answerKey.length) * 100);
    const category = getPerformanceCategory(percentage);

    onSave(student.id, name, answers, score, percentage, category);
    onClose();
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Registro de Aluno</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="editName">Nome do Aluno</Label>
            <Input 
              id="editName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Respostas</Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {answers.map((ans, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] text-center text-muted-foreground">Q{idx + 1}</span>
                  <Input
                    className="text-center font-bold uppercase h-10 w-full"
                    maxLength={1}
                    value={ans}
                    onChange={(e) => handleUpdateAnswer(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
