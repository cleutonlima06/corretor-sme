"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StudentRecord } from "@/lib/types"

const chartConfig = {
  count: {
    label: "Alunos",
  },
  critico: {
    label: "Crítico",
    color: "#ef4444", // Vermelho
  },
  intermediario: {
    label: "Intermediário",
    color: "#eab308", // Amarelo
  },
  adequado: {
    label: "Adequado",
    color: "#22c55e", // Verde
  },
} satisfies ChartConfig

export function PerformanceChart({ students }: { students: StudentRecord[] }) {
  const data = [
    { 
      category: "Crítico", 
      count: students.filter(s => s.category === 'CRÍTICO').length,
      fill: "var(--color-critico)"
    },
    { 
      category: "Intermediário", 
      count: students.filter(s => s.category === 'INTERMEDIÁRIO').length,
      fill: "var(--color-intermediario)"
    },
    { 
      category: "Adequado", 
      count: students.filter(s => s.category === 'ADEQUADO').length,
      fill: "var(--color-adequado)"
    },
  ]

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
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
  )
}
