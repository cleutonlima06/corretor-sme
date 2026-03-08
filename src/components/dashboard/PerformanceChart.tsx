"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function PerformanceChart({ students }: { students: StudentRecord[] }) {
  const data = [
    { category: "Crítico", count: students.filter(s => s.category === 'CRÍTICO').length },
    { category: "Intermediário", count: students.filter(s => s.category === 'INTERMEDIÁRIO').length },
    { category: "Adequado", count: students.filter(s => s.category === 'ADEQUADO').length },
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
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
