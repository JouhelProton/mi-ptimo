import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, DAY_SHORT, fromKey, startOfWeek, toKey, todayLocal, weekIndex, START, END, diffDays } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const focusDate = () => {
  const t = todayLocal();
  if (diffDays(t, START) < 0) return START;
  if (diffDays(END, t) < 0) return END;
  return t;
};

export function WeekStrip({ value, onChange, dots }: { value: string; onChange: (k: string) => void; dots?: (k: string) => string | undefined }) {
  const d = fromKey(value);
  const mon = startOfWeek(d);
  const today = toKey(todayLocal());
  const w = weekIndex(d);
  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button aria-label="Semana anterior" onClick={() => onChange(toKey(addDays(d, -7)))} className="grid h-10 w-10 place-items-center rounded-full bg-muted"><ChevronLeft className="h-5 w-5" /></button>
        <div className="min-w-0 text-center">
          <div className="text-sm font-semibold">{w >= 0 && w < 52 ? `Semana ${w + 1} de 52` : w < 0 ? "Antes del inicio" : "Fuera del plan"}</div>
          <input type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className="bg-transparent text-center text-xs text-muted-foreground" aria-label="Ir a fecha" />
        </div>
        <button aria-label="Semana siguiente" onClick={() => onChange(toKey(addDays(d, 7)))} className="grid h-10 w-10 place-items-center rounded-full bg-muted"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(mon, i);
          const k = toKey(day);
          const sel = k === value;
          const dot = dots?.(k);
          return (
            <button key={k} onClick={() => onChange(k)} className={cn("flex min-h-14 flex-col items-center justify-center rounded-xl", sel ? "bg-primary text-primary-foreground" : k === today ? "bg-muted" : "")}>
              <span className={cn("text-[10px] font-medium", !sel && "text-muted-foreground")}>{DAY_SHORT[i]}</span>
              <span className="num text-base font-semibold">{day.getDate()}</span>
              <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", dot || "bg-transparent")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
