"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Save } from "lucide-react"

interface StudentEntryFormProps {
  questionCount: number;
  onAdd: (name: string, answers: string[]) => void;
}

export function StudentEntryForm({ questionCount, onAdd }: StudentEntryFormProps) {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(questionCount).fill(""));

  const handleUpdateAnswer = (index: number, value: string) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value.toUpperCase();
    setAnswers(nextAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, answers);
    setName("");
    setAnswers(Array(questionCount).fill(""));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Novo Registro de Aluno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="studentName">Nome do Aluno</Label>
            <Input 
              id="studentName" 
              placeholder="Digite o nome completo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Respostas (Questão por Questão)</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {answers.map((ans, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground text-center">Q{idx + 1}</span>
                  <Input
                    className="text-center font-bold uppercase h-9 w-full border-primary/20 focus:border-primary answer-box-transition"
                    maxLength={1}
                    value={ans}
                    onChange={(e) => handleUpdateAnswer(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 flex gap-2">
            <Save className="h-4 w-4" /> Registrar Notas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
