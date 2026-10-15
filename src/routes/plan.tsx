import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, DAY_NAMES, diffDays, fmtShort, fromKey, START, startOfWeek, toKey, todayLocal, weekIndex } from "@/lib/dates";
import { BLOCKS, blockOf, dayActivities, isDeload } from "@/lib/plan";
import { useApp } from "@/lib/store";
import { Card, Page, SectionTitle } from "@/components/ui-kit";
import { actColor, actIcon } from "@/components/SessionView";
import { focusDate, WeekStrip } from "@/components/WeekStrip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => ({ meta: [{ title: "Plan · OPERATOR" }, { name: "description", content: "52 semanas y 13 mesociclos, nov 2026 – oct 2027." }, { property: "og:title", content: "Plan · OPERATOR" }, { property: "og:description", content: "Calendario anual de entrenamiento." }] }),
  component: Plan,
});

function Plan() {
  const s = useApp();
  const [k, setK] = useState(toKey(focusDate()));
  const mon = startOfWeek(fromKey(k));
  const cur = weekIndex(todayLocal());
  const before = diffDays(START, todayLocal());
  return (
    <Page title="Plan" subtitle="2 nov 2026 – 31 oct 2027">
      {before > 0 && <Card className="bg-primary/10"><span className="num text-2xl font-bold">{before}</span> <span className="text-sm text-muted-foreground">días para empezar</span></Card>}
      <WeekStrip value={k} onChange={setK} />
      <Card>
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(mon, i);
          const key = toKey(d);
          return (
            <Link key={key} to="/sesion/$date" params={{ date: key }} className="flex min-h-12 items-center gap-3 border-b py-2 last:border-0">
              <span className="w-9 shrink-0 text-xs text-muted-foreground">{DAY_NAMES[i].slice(0, 3)} {d.getDate()}</span>
              <div className="min-w-0 flex-1 space-y-0.5">
                {dayActivities(d, s.settings, s.routines).map((a) => { const I = actIcon(a.type); return (
                  <div key={a.id} className="flex items-center gap-2 text-sm"><I className={cn("h-4 w-4 shrink-0", actColor(a.type))} /><span className="truncate">{a.title}</span><span className="num ml-auto shrink-0 text-xs text-muted-foreground">{a.start ?? ""}</span></div>
                ); })}
              </div>
            </Link>
          );
        })}
      </Card>
      <div>
        <SectionTitle>13 mesociclos · 3 semanas carga + 1 descarga</SectionTitle>
        <div className="space-y-2">
          {BLOCKS.map((b, i) => {
            const st = addDays(START, i * 28);
            const active = cur >= 0 && blockOf(cur) === i;
            return (
              <button key={i} onClick={() => setK(toKey(st))} className={cn("card w-full p-4 text-left", active && "border-primary")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{i + 1}. {b.name}</span>
                  <span className="num shrink-0 text-xs text-muted-foreground">{fmtShort(st)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                <div className="mt-2 flex gap-1">{[0, 1, 2, 3].map((w) => <span key={w} className={cn("h-1.5 flex-1 rounded-full", isDeload(i * 4 + w) ? "bg-swim/60" : "bg-primary/60", cur === i * 4 + w && "bg-foreground")} />)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Noviembre: 1 carrera y 1 natación semanales. Diciembre: segunda carrera solo si recuperación/nutrición lo permiten (actívala en Ajustes). Segunda natación opcional desde el bloque 3.</p>
    </Page>
  );
}
