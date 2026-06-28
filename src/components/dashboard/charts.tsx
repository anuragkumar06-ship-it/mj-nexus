"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Series {
  key: string;
  color: string;
  name?: string;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-navy/10 bg-white/95 px-3 py-2 text-xs shadow-[0_10px_30px_-10px_rgba(5,11,61,0.3)] backdrop-blur">
      {label !== undefined && (
        <p className="mb-1.5 font-semibold text-navy">{label}</p>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color || p.payload?.color || p.fill }}
          />
          <span className="text-slate-500">{p.name}</span>
          <span className="ml-3 font-semibold text-navy tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

const axisTick = { fontSize: 11, fill: "#94a3b8" };

export function AreaTrend({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: any[];
  xKey: string;
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.34} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(5,11,61,0.06)" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} dy={6} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(29,127,255,0.25)", strokeWidth: 1 }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name || s.key}
            stroke={s.color}
            strokeWidth={2.6}
            fill={`url(#area-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarGroup({
  data,
  xKey,
  series,
  height = 260,
  horizontal = false,
  stacked = false,
}: {
  data: any[];
  xKey: string;
  series: Series[];
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, left: horizontal ? 8 : -18, bottom: 0 }}
        barGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} stroke="rgba(5,11,61,0.06)" />
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} />
            <YAxis type="category" dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} width={92} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
          </>
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(29,127,255,0.06)" }} />
        {series.map((s, idx) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name || s.key}
            fill={s.color}
            radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
            stackId={stacked ? "a" : undefined}
            maxBarSize={horizontal ? 22 : 46}
            animationDuration={900}
            animationBegin={idx * 120}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: any[];
  xKey: string;
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(5,11,61,0.06)" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} dy={6} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(29,127,255,0.25)" }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name || s.key}
            stroke={s.color}
            strokeWidth={2.6}
            dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            animationDuration={1100}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 240,
  inner = 58,
  outer = 86,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  inner?: number;
  outer?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={3}
          stroke="none"
          animationDuration={900}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadarCompare({
  data,
  series,
  height = 300,
}: {
  data: any[];
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(5,11,61,0.1)" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip content={<ChartTooltip />} />
        {series.map((s) => (
          <Radar
            key={s.key}
            dataKey={s.key}
            name={s.name || s.key}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.18}
            strokeWidth={2}
            animationDuration={900}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
