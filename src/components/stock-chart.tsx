'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface StockChartProps {
  data: { date: string; price: number }[]
}

const chartConfig = {
  price: {
    label: 'السعر',
    color: 'hsl(var(--chart-1))',
  },
}

export function StockChart({ data }: StockChartProps) {
  return (
    <div className="h-[300px] w-full rtl">
       <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
            top: 10,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis
            domain={['dataMin - 5', 'dataMax + 5']}
            hide
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="price"
            type="natural"
            fill="var(--color-price)"
            fillOpacity={0.4}
            stroke="var(--color-price)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
