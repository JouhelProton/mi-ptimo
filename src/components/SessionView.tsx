import { Bike, Dumbbell, Moon, Plus, Waves, Footprints } from "lucide-react";
import { fromKey, weekIndex, DAY_NAMES } from "@/lib/dates";
import { blockOf, BLOCKS, dayActivities, isDeload, prescribe, runGuide, swimGuide, type Activity } from "@/lib/plan";
import { dayLog, editDay, useApp, type SetLog } from "@/lib/store";
import { Btn, Card, CheckRow, Tag, Warn } from "./ui-kit";
import { cn } from "@/lib/utils";

export const actIcon = (t: Activity["type"]) => ({ gym: Dumbbell, swim: Waves, run: Footprints, rest: Moon })[t] || Bike;
export const actColor = (t: Activity["type"]) => ({ gym: "text-primary", swim: "text-swim", run: "text-run", rest: "text-sleep" })[t];

export function HipWarning() {
  return <Warn>Cadera: si hay dolor en flexores de cadera, no progreses cargas ni entrenes con dolor. Consulta a un fisio o médico deportivo.</Warn>;
}
export function SwimWarning() {
  return <Warn tone="swim">Natación solo en piscina vigilada, con formación técnica. Nada de mar en solitario, apnea ni hiperventilación.</Warn>;
}

export function SessionView({ dateKey }: { dateKey: string }) {
  const s = useApp();
  const d = fromKey(dateKey);
  const w = weekIndex(d);
  const wk = Math.max(0, w);
  const log = dayLog(s, dateKey);
  const acts = dayActivities(d, s.settings, s.routines);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{DAY_NAMES[(d.getDay() + 6) % 7]}</span>
        <span>· Bloque {blockOf(wk) + 1}: {BLOCKS[blockOf(wk)].name}</span>
        {isDeload(wk) && <span className="rounded-full bg-swim/15 px-2 py-0.5 font-semibold text-swim">Semana de descarga</span>}
      </div>
      {acts.map((a) => (
        <ActivityCard key={a.id} a={a} dateKey={dateKey} week={wk} />
      ))}
      <Card>
        <div className="mb-2 text-sm font-semibold">Sensaciones del día <Tag kind="real" /></div>
        <Slider label="Energía" value={log.energy} onChange={(v) => editDay(dateKey, (l) => (l.energy = v))} />
        <Slider label="Molestias / dolor" value={log.pain} onChange={(v) => editDay(dateKey, (l) => (l.pain = v))} danger />
        {(log.pain ?? 0) >= 4 && <div className="mt-2"><HipWarning /></div>}
        <textarea className="field mt-3 min-h-16" placeholder="Notas" value={log.note || ""} onChange={(e) => editDay(dateKey, (l) => (l.note = e.target.value))} />
      </Card>
    </div>
  );
}

function Slider({ label, value, onChange, danger }: { label: string; value?: number; onChange: (v: number) => void; danger?: boolean }) {
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{label}</span><span className="num">{value ?? "—"}/10</span></div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button key={i} onClick={() => onChange(i)} className={cn("num h-8 rounded-md text-[11px]", value === i ? (danger ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground")}>{i}</button>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ a, dateKey, week }: { a: Activity; dateKey: string; week: number }) {
  const s = useApp();
  const log = dayLog(s, dateKey);
  const done = !!log.done?.[a.id];
  const Icon = actIcon(a.type);
  const toggle = () => editDay(dateKey, (l) => { l.done ||= {}; l.done[a.id] = !l.done[a.id]; });

  return (
    <Card>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl bg-muted", actColor(a.type))}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight">{a.title}</div>
          {a.start && <div className="num text-xs text-muted-foreground">{a.start}–{a.end}{a.optional && " · opcional"}</div>}
        </div>
      </div>

      {a.type === "rest" && <p className="mt-3 text-sm text-muted-foreground">Descanso activo: paseo, movilidad suave y preparar tuppers de la semana.</p>}
      {a.type === "run" && <Guide items={runGuide(week)} />}
      {a.type === "swim" && <><div className="mt-3"><SwimWarning /></div><Guide items={swimGuide(week)} /></>}
      {a.type === "gym" && a.routine && <GymLog routineKey={a.routine} dateKey={dateKey} week={week} />}

      {a.type !== "rest" && (
        <div className="mt-4 border-t pt-3">
          <CheckRow done={done} onToggle={toggle} label={done ? "Sesión completada" : "Marcar sesión como completada"} />
        </div>
      )}
    </Card>
  );
}

function Guide({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {items.map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" /><span>{t}</span></li>)}
    </ul>
  );
}

function GymLog({ routineKey, dateKey, week }: { routineKey: keyof ReturnType<typeof useApp>["routines"]; dateKey: string; week: number }) {
  const s = useApp();
  const log = dayLog(s, dateKey);
  const routine = s.routines[routineKey];
  const isLegs = routineKey === "legs";

  const setField = (exId: string, i: number, patch: Partial<SetLog>, n: number, defW: string, defR: string) =>
    editDay(dateKey, (l) => {
      l.sets ||= {};
      const arr = l.sets[exId] || Array.from({ length: n }, () => ({ w: defW, reps: defR, rpe: "", done: false }));
      while (arr.length < n) arr.push({ w: defW, reps: defR, rpe: "", done: false });
      arr[i] = { ...arr[i], ...patch };
      l.sets[exId] = arr;
    });
  const addSet = (exId: string, n: number) =>
    editDay(dateKey, (l) => {
      l.sets ||= {};
      const arr = l.sets[exId] || Array.from({ length: n }, () => ({ w: "", reps: "", rpe: "", done: false }));
      arr.push({ w: arr.at(-1)?.w || "", reps: arr.at(-1)?.reps || "", rpe: "", done: false });
      l.sets[exId] = arr;
    });

  return (
    <div className="mt-4 space-y-4">
      {isLegs && <HipWarning />}
      {routine.exercises.map((e) => {
        const p = prescribe(e, week);
        const gated = e.main === "squat" && !log.squatClear;
        const logged = log.sets?.[e.id];
        const n = Math.max(p.sets, logged?.length || 0);
        const defW = p.load === "BW" || p.load === "Sin prescribir" ? "" : p.load;
        const defR = p.reps.split("-")[0];
        return (
          <div key={e.id} className="rounded-xl bg-muted/50 p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{e.name}</div>
                <div className="num text-xs text-muted-foreground">
                  {p.sets}×{p.reps}{p.load ? ` · ${p.load}${/^\d/.test(p.load) ? " kg" : ""}` : ""}{e.rpe ? ` · RPE ${e.rpe}` : ""}
                </div>
              </div>
              {p.note && <span className="self-start rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{p.note.split(":")[0]}</span>}
            </div>
            {e.notes && <p className="mt-1 text-xs text-muted-foreground">{e.notes}</p>}
            {p.note && p.note.includes(":") && <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>}
            {gated ? (
              <div className="mt-3 space-y-2">
                <Warn>Sentadilla bloqueada hasta confirmar: sin dolor hoy y valoración profesional hecha.</Warn>
                <Btn variant="soft" className="w-full" onClick={() => editDay(dateKey, (l) => (l.squatClear = true))}>Confirmo: sin dolor y valorado</Btn>
              </div>
            ) : (
              <div className="mt-3 space-y-1.5">
                <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.25rem] gap-1.5 px-0.5 text-[10px] uppercase text-muted-foreground">
                  <span>#</span><span>kg</span><span>reps</span><span>RPE</span><span />
                </div>
                {Array.from({ length: n }, (_, i) => {
                  const st = logged?.[i] || { w: defW, reps: defR, rpe: "", done: false };
                  return (
                    <div key={i} className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.25rem] items-center gap-1.5">
                      <span className="num text-xs text-muted-foreground">{i + 1}</span>
                      <input inputMode="decimal" className="field num py-1.5" value={st.w} placeholder={p.load === "BW" ? "BW" : "—"} onChange={(ev) => setField(e.id, i, { w: ev.target.value }, n, defW, defR)} />
                      <input inputMode="numeric" className="field num py-1.5" value={st.reps} onChange={(ev) => setField(e.id, i, { reps: ev.target.value }, n, defW, defR)} />
                      <input inputMode="decimal" className="field num py-1.5" value={st.rpe} placeholder={e.rpe || "—"} onChange={(ev) => setField(e.id, i, { rpe: ev.target.value }, n, defW, defR)} />
                      <button aria-label="Serie hecha" onClick={() => setField(e.id, i, { done: !st.done }, n, defW, defR)} className={cn("h-9 rounded-lg text-xs font-bold", st.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>✓</button>
                    </div>
                  );
                })}
                <button onClick={() => addSet(e.id, n)} className="flex items-center gap-1 pt-1 text-xs text-muted-foreground"><Plus className="h-3.5 w-3.5" /> Añadir serie</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
