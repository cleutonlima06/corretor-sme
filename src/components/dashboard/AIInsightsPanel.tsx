"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Loader2, AlertTriangle, Lightbulb, BookOpen } from "lucide-react"
import { analyzeEducatorInsights, EducatorInsightAnalysisOutput } from "@/ai/flows/educator-insight-analysis"
import { StudentRecord } from "@/lib/types"

export function AIInsightsPanel({ answerKey, students }: { answerKey: string[], students: StudentRecord[] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<EducatorInsightAnalysisOutput | null>(null);

  const handleAnalyze = async () => {
    if (students.length === 0) return;
    
    setLoading(true);
    try {
      const result = await analyzeEducatorInsights({
        answerKey,
        studentResponses: students.map(s => ({
          studentName: s.name,
          answers: s.answers
        }))
      });
      setInsights(result);
    } catch (error: any) {
      console.error("Erro na análise de IA:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Análise Inteligente (IA)
            </CardTitle>
            <CardDescription>Descubra padrões e dificuldades ocultas nas respostas.</CardDescription>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || students.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Erros Comuns
              </h3>
              {insights.commonErrors.length > 0 ? insights.commonErrors.map((err, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-red-100 text-sm">
                  <p className="font-bold">Questão {err.questionIndex + 1}</p>
                  <p className="text-muted-foreground mt-1">Resposta incorreta "{err.incorrectAnswer}" ({err.count} alunos)</p>
                  {err.analysis && <p className="mt-2 text-xs italic">{err.analysis}</p>}
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic">Nenhum erro comum significativo identificado.</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-yellow-600">
                <Lightbulb className="h-4 w-4" />
                Questões Problemáticas
              </h3>
              {insights.problematicQuestions.length > 0 ? insights.problematicQuestions.map((q, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-yellow-100 text-sm">
                  <p className="font-bold">Questão {q.questionIndex + 1}</p>
                  <p className="text-yellow-600 font-medium">Taxa de erro: {q.errorRate}%</p>
                  <p className="text-muted-foreground mt-1 text-xs">{q.reason}</p>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic">Todas as questões tiveram bom desempenho.</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <BookOpen className="h-4 w-4" />
                Sugestões de Tópicos
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.suggestedLearningTopics.length > 0 ? insights.suggestedLearningTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                    {topic}
                  </span>
                )) : (
                  <p className="text-xs text-muted-foreground italic">Continue com o plano de ensino atual.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground italic text-sm">
            {!loading ? "Clique em 'Gerar Insights' para analisar o desempenho atual da turma." : "Aguarde, a IA está analisando as respostas..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
