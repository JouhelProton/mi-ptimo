import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { fromKey, toKey } from "@/lib/dates";
import { dayActivities, type RoutineKey } from "@/lib/plan";
import { update, useApp } from "@/lib/store";
import { Btn, Card, Page, SectionTitle } from "@/components/ui-kit";
import { SessionView } from "@/components/SessionView";
import { focusDate, WeekStrip } from "@/components/WeekStrip";

export const Route = createFileRoute("/entrenar")({
  head: () => ({ meta: [{ title: "Entrenar · OPERATOR" }, { name: "description", content: "Sesiones, registro por serie y rutinas editables." }, { property: "og:title", content: "Entrenar · OPERATOR" }, { property: "og:description", content: "Powerlifting, carrera y natación." }] }),
  component: Entrenar,
});

function Entrenar() {
  const s = useApp();
  const [k, setK] = useState(toKey(focusDate()));
  const [edit, setEdit] = useState<RoutineKey | null>(null);
  const dots = (key: string) => {
    const a = dayActivities(fromKey(key), s.settings, s.routines).filter((x) => x.type !== "rest");
    if (!a.length) return undefined;
    return a.every((x) => s.logs[key]?.done?.[x.id]) ? "bg-primary" : "bg-muted-foreground/50";
  };
  return (
    <Page title="Entrenar" subtitle="Registro por serie">
      <WeekStrip value={k} onChange={setK} dots={dots} />
      <SessionView dateKey={k} />
      <Card>
        <SectionTitle>Editar rutinas</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(s.routines) as RoutineKey[]).map((r) => (
            <Btn key={r} variant={edit === r ? "primary" : "soft"} onClick={() => setEdit(edit === r ? null : r)}>{s.routines[r].title.split(" ·")[0]}</Btn>
          ))}
        </div>
        {edit && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">La carga aquí se usa desde la semana 5 (nov tiene cargas fijas en básicos). Sube +2.5 kg solo con RPE ≤ 7-8, buena técnica y recuperación.</p>
            {s.routines[edit].exercises.map((e, i) => (
              <div key={e.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
                <div className="flex gap-2">
                  <input className="field font-semibold" value={e.name} onChange={(v) => update((st) => (st.routines[edit].exercises[i].name = v.target.value))} />
                  <button aria-label="Eliminar" onClick={() => update((st) => st.routines[edit].exercises.splice(i, 1))} className="px-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                  {(["sets", "reps", "load", "rpe"] as const).map((f) => (
                    <label key={f} className="min-w-0">{{ sets: "Series", reps: "Reps", load: "Carga", rpe: "RPE" }[f]}
                      <input className="field num mt-1 text-sm" value={String(e[f])} disabled={e.main === "squat" && f === "load"} onChange={(v) => update((st) => { const x = st.routines[edit].exercises[i]; if (f === "sets") x.sets = Number(v.target.value) || 1; else x[f] = v.target.value; })} />
                    </label>
                  ))}
                </div>
                <input className="field text-sm" placeholder="Notas" value={e.notes} onChange={(v) => update((st) => (st.routines[edit].exercises[i].notes = v.target.value))} />
              </div>
            ))}
            <Btn variant="ghost" className="w-full" onClick={() => update((st) => st.routines[edit].exercises.push({ id: `x${Date.now()}`, name: "Nuevo ejercicio", sets: 3, reps: "10", load: "", rpe: "7-8", notes: "" }))}>Añadir ejercicio</Btn>
          </div>
        )}
      </Card>
    </Page>
  );
}
