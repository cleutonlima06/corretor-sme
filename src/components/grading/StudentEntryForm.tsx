
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Save, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface StudentEntryFormProps {
  questionCount: number;
  onAdd: (name: string, answers: string[]) => void;
  registeredNames?: string[];
  existingRecords?: string[]; // IDs/Nomes de alunos que já possuem nota nesta turma
}

export function StudentEntryForm({ questionCount, onAdd, registeredNames = [], existingRecords = [] }: StudentEntryFormProps) {
  const [entries, setEntries] = useState<Record<string, string[]>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialEntries: Record<string, string[]> = {};
    registeredNames.forEach(name => {
      initialEntries[name] = Array(questionCount).fill("");
    });
    setEntries(initialEntries);
  }, [registeredNames, questionCount]);

  const handleUpdateAnswer = (name: string, index: number, value: string) => {
    // Se já foi salvo ou já existe registro, não permite edição
    if (savedStatus[name] || existingRecords.includes(name)) return;

    setEntries(prev => ({
      ...prev,
      [name]: prev[name].map((ans, i) => i === index ? value.toUpperCase() : ans)
    }));
  };

  const handleSaveStudent = (name: string) => {
    const answers = entries[name];
    if (!answers) return;

    // Verifica se o aluno já foi salvo para evitar duplicidade
    if (savedStatus[name] || existingRecords.includes(name)) {
      toast({
        variant: "destructive",
        title: "Ação bloqueada",
        description: `As notas de ${name} já foram registradas anteriormente.`
      });
      return;
    }

    // Verifica se preencheu ao menos uma questão
    if (answers.every(a => !a.trim())) {
      toast({
        variant: "destructive",
        title: "Campo vazio",
        description: `Por favor, preencha as respostas de ${name} antes de salvar.`
      });
      return;
    }

    onAdd(name, answers);
    setSavedStatus(prev => ({ ...prev, [name]: true }));
    
    toast({
      title: "Lançamento Realizado",
      description: `As notas de ${name} foram salvas com sucesso.`,
    });
  };

  if (registeredNames.length === 0) {
    return (
      <Card className="border-dashed bg-slate-50">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold">Nenhum aluno cadastrado</h3>
            <p className="text-sm text-muted-foreground">Vá até a aba "Perfil" para cadastrar ou importar os nomes dos alunos da sua turma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-lg font-bold">Lançamento em Massa</h2>
          <p className="text-xs text-muted-foreground">O sistema permite apenas um salvamento por aluno para garantir a integridade dos dados.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-primary uppercase">Turma com {registeredNames.length} alunos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {registeredNames.map((name) => {
          const isSaved = savedStatus[name];
          const hasExisting = existingRecords.includes(name);
          const isBlocked = isSaved || hasExisting;

          return (
            <Card key={name} className={cn(
              "shadow-sm transition-all border-l-4",
              isBlocked ? "border-l-green-500 bg-slate-50/50 opacity-90" : "border-l-primary/30"
            )}>
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="min-w-[180px] space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Aluno</Label>
                    <p className="font-bold text-slate-800">{name}</p>
                    {isBlocked && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Lançamento Concluído
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Respostas (Questões 1 a {questionCount})</Label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {Array(questionCount).fill("").map((_, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="block text-[10px] text-center text-muted-foreground font-medium">Q{idx + 1}</span>
                          <Input
                            className={cn(
                              "text-center font-bold uppercase h-10 w-full p-0 border-slate-200 focus:border-primary answer-box-transition",
                              isBlocked && "bg-slate-100 border-transparent text-slate-400"
                            )}
                            maxLength={1}
                            value={entries[name]?.[idx] || ""}
                            onChange={(e) => handleUpdateAnswer(name, idx, e.target.value)}
                            disabled={isBlocked}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto self-end md:self-center">
                    <Button 
                      onClick={() => handleSaveStudent(name)}
                      disabled={isBlocked}
                      variant={isBlocked ? "outline" : "default"}
                      className={cn(
                        "w-full md:w-32 gap-2 font-bold", 
                        isBlocked && "text-green-600 border-green-200 bg-white hover:bg-white"
                      )}
                    >
                      {isBlocked ? "Salvo" : "Salvar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
