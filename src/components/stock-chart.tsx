'use client'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart'
import { getCurrencySymbol } from '@/lib/utils'

interface StockChartProps {
  data: { date: string; price: number }[]
  currency: 'SAR' | 'QAR' | 'AED'
}

export function StockChart({ data, currency }: StockChartProps) {
  const currencySymbol = getCurrencySymbol(currency);
  return (
    <div className="h-[250px] w-full md:h-[400px]">
      <ChartContainer config={{}} className="h-full w-full">
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border) / 0.5)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                })
              }
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value} ${currencySymbol}`}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={80}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--accent))',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${Number(value).toFixed(2)} ${currencySymbol}`}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return new Date(
                        payload[0].payload.date
                      ).toLocaleDateString('ar-SA', { dateStyle: 'medium' })
                    }
                    return label
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
