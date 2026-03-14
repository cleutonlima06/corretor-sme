
"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StudentRecord } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FileDown, GraduationCap, School, Calendar, BookOpen } from "lucide-react"

const chartConfig = {
  count: {
    label: "Alunos",
  },
  abaixo: {
    label: "Abaixo do básico",
    color: "#ef4444",
  },
  basico: {
    label: "Básico",
    color: "#eab308",
  },
  proficiente: {
    label: "Proficiente",
    color: "#f97316",
  },
  avancado: {
    label: "Avançado",
    color: "#22c55e",
  },
} satisfies ChartConfig

interface PerformanceChartProps {
  students: StudentRecord[];
  profileData?: any;
}

export function PerformanceChart({ students, profileData }: PerformanceChartProps) {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('pt-BR'));
  }, []);

  const data = [
    { 
      category: "Abaixo do Básico", 
      count: students.filter(s => s.category === 'ABAIXO DO BÁSICO').length,
      fill: "var(--color-abaixo)"
    },
    { 
      category: "Básico", 
      count: students.filter(s => s.category === 'BÁSICO').length,
      fill: "var(--color-basico)"
    },
    { 
      category: "Proficiente", 
      count: students.filter(s => s.category === 'PROFICIENTE').length,
      fill: "var(--color-proficiente)"
    },
    { 
      category: "Avançado", 
      count: students.filter(s => s.category === 'AVANÇADO').length,
      fill: "var(--color-avancado)"
    },
  ]

  const handleSavePDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print-full-width">
      {/* Cabeçalho exclusivo para o PDF de desempenho */}
      <div className="hidden print:block mb-8 border-b-2 border-primary/20 pb-6 w-full">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-6 w-6" />
              <h1 className="text-2xl font-bold tracking-tight">Corretor SME Pro</h1>
            </div>
            <p className="text-muted-foreground text-sm italic">Relatório de Distribuição de Desempenho - {currentDate}</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-lg font-bold flex items-center justify-end gap-2 text-primary">
              <School className="h-4 w-4" /> {profileData?.schoolId || 'Escola não informada'}
            </h2>
            <div className="text-sm text-muted-foreground flex flex-col items-end">
              <span className="flex items-center gap-1 font-medium">Turma: {profileData?.classroomId || '-'}</span>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {profileData?.academicYear || '-'}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {profileData?.subjectId || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end no-print">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSavePDF} 
          className="gap-2 text-xs border-primary/20 hover:bg-primary/5"
        >
          <FileDown className="h-3 w-3" /> Salvar em PDF
        </Button>
      </div>

      <div className="print-chart-container w-full print:bg-slate-50 print:p-8 print:rounded-2xl print:border-2 print:border-primary/10">
        <ChartContainer config={chartConfig} className="h-[400px] w-full print:h-[650px]">
          <BarChart 
            accessibilityLayer 
            data={data} 
            margin={{ top: 30, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={20}
              axisLine={false}
              fontSize={11}
              fontWeight={600}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              fontSize={12}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={65}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="hidden print:block mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-muted-foreground">
        Gráfico gerado pelo sistema Corretor SME Pro. Total de alunos analisados nesta turma: {students.length}.
      </div>
    </div>
  )
}
