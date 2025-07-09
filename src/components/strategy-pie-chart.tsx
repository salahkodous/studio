'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"

interface StrategyPieChartProps {
    chartData: any[];
    chartConfig: ChartConfig;
}

export function StrategyPieChart({ chartData, chartConfig }: StrategyPieChartProps) {
    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="percentage"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={2}
                    fill="hsl(var(--chart-1))"
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                            className="focus:outline-none"
                        />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}
