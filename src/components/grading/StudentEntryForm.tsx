"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudentEntryFormProps {
  questionCount: number;
  onAdd: (name: string, answers: string[]) => void;
}

export function StudentEntryForm({ questionCount, onAdd }: StudentEntryFormProps) {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(questionCount).fill(""));
  const { toast } = useToast();

  const handleUpdateAnswer = (index: number, value: string) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value.toUpperCase();
    setAnswers(nextAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, answers);
    
    toast({
      title: "Respostas cadastradas",
      description: `O registro de ${name} foi salvo com sucesso.`,
      variant: "default",
    });

    setName("");
    setAnswers(Array(questionCount).fill(""));
  };

  return (
    <Card className="shadow-lg border-primary/10">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="py-6 text-lg"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Folha de Respostas</Label>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
              {answers.map((ans, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground text-center">Q{idx + 1}</span>
                  <Input
                    className="text-center font-bold uppercase h-12 w-full border-primary/20 focus:border-primary focus:ring-primary answer-box-transition text-lg"
                    maxLength={1}
                    value={ans}
                    onChange={(e) => handleUpdateAnswer(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 flex gap-2 py-6 text-lg font-bold shadow-md">
            <Save className="h-5 w-5" /> Registrar Notas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
