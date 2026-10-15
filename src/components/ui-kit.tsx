import { Link } from "@tanstack/react-router";
import { Check, Settings as Gear } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ title, subtitle, children, action }: { title: string; subtitle?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-safe pb-nav">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pb-4 pt-3">
        <div className="min-w-0">
          {subtitle && <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</p>}
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <Link to="/ajustes" aria-label="Ajustes" className="grid h-10 w-10 place-items-center rounded-full glass text-muted-foreground">
            <Gear className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("card p-4", className)}>{children}</section>;
}
export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{children}</h2>
      {right}
    </div>
  );
}
export function Tag({ kind }: { kind: "real" | "est" | "ref" }) {
  const map = { real: ["Real", "bg-primary/15 text-primary"], est: ["Estimado", "bg-warning/15 text-warning"], ref: ["Referencia", "bg-swim/15 text-swim"] } as const;
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[kind][1])}>{map[kind][0]}</span>;
}
export function Btn({ children, onClick, variant = "primary", className, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "soft" | "danger"; className?: string; type?: "button" | "submit" }) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    soft: "bg-secondary text-secondary-foreground",
    ghost: "bg-transparent text-muted-foreground border border-border",
    danger: "bg-destructive/15 text-destructive",
  }[variant];
  return (
    <button type={type} onClick={onClick} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98]", v, className)}>
      {children}
    </button>
  );
}
export function CheckRow({ done, onToggle, label, sub, right }: { done: boolean; onToggle: () => void; label: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-3">
      <button onClick={onToggle} aria-pressed={done} aria-label="Marcar" className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition", done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
        {done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn("text-[15px] font-medium leading-tight", done && "text-muted-foreground line-through")}>{label}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
      {right}
    </div>
  );
}
export function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full bg-primary transition-all", className)} style={{ width: `${pct}%` }} />
    </div>
  );
}
export function Ring({ value, size = 64, children }: { value: number; size?: number; children?: ReactNode }) {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted" strokeWidth={6} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-primary transition-all" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">{children}</div>;
}
export function Warn({ children, tone = "warning" }: { children: ReactNode; tone?: "warning" | "swim" }) {
  return <div className={cn("rounded-xl border p-3 text-[13px] leading-snug", tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-swim/30 bg-swim/10 text-swim")}>{children}</div>;
}

export function LineChart({ data, unit = "", height = 140 }: { data: { label: string; y: number }[]; unit?: string; height?: number }) {
  if (data.length === 0) return <Empty>Sin datos registrados todavía.</Empty>;
  const W = 320, H = height, P = 22;
  const ys = data.map((d) => d.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const x = (i: number) => (data.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (data.length - 1));
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2 * P);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.y)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <line x1={P} x2={W - P} y1={H - P} y2={H - P} className="stroke-border" />
      <path d={path} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.y)} r={3.5} className="fill-primary" />)}
      <text x={P} y={12} className="fill-muted-foreground text-[10px]">{max.toFixed(1)}{unit}</text>
      <text x={P} y={H - 6} className="fill-muted-foreground text-[10px]">{data[0].label}</text>
      <text x={W - P} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">{data[data.length - 1].label}</text>
    </svg>
  );
}
export function BarChart({ data, target }: { data: { label: string; y: number }[]; target?: number }) {
  if (data.length === 0) return <Empty>Sin datos registrados todavía.</Empty>;
  const max = Math.max(target || 0, ...data.map((d) => d.y)) || 1;
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div className={cn("w-full rounded-md", target && d.y >= target - 0.25 ? "bg-primary" : "bg-sleep")} style={{ height: `${(d.y / max) * 100}%` }} />
          </div>
          <span className="truncate text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
