"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StudentRecord } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

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

export function PerformanceChart({ students }: { students: StudentRecord[] }) {
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
    <div className="space-y-4">
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
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            fontSize={10}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="count" radius={4}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
