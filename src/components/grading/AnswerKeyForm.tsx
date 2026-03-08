"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

interface AnswerKeyFormProps {
  currentKey: string[];
  onSave: (newKey: string[]) => void;
}

export function AnswerKeyForm({ currentKey, onSave }: AnswerKeyFormProps) {
  const [key, setKey] = useState<string[]>(currentKey);

  const handleUpdateCount = (count: number) => {
    const safeCount = Math.max(1, Math.min(50, count));
    const nextKey = Array(safeCount).fill("").map((_, i) => key[i] || "");
    setKey(nextKey);
  };

  const handleUpdateValue = (index: number, value: string) => {
    const nextKey = [...key];
    nextKey[index] = value.toUpperCase();
    setKey(nextKey);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gabarito Oficial</CardTitle>
        <CardDescription>Defina as respostas corretas para a avaliação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="questionCount">Quantidade de Questões</Label>
            <Input 
              id="questionCount" 
              type="number" 
              value={key.length} 
              onChange={(e) => handleUpdateCount(parseInt(e.target.value) || 0)} 
            />
          </div>
          <Button onClick={() => onSave(key)} className="flex gap-2 bg-primary hover:bg-primary/90">
            <Check className="h-4 w-4" /> Salvar Gabarito
          </Button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {key.map((val, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground text-center">Q{idx + 1}</span>
              <Input
                className="text-center font-bold uppercase"
                maxLength={1}
                value={val}
                onChange={(e) => handleUpdateValue(idx, e.target.value)}
                placeholder="-"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
