import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, diffDays, fmtLong, START, toKey, todayLocal, weekIndex, DAY_NAMES } from "@/lib/dates";
import { BLOCKS, blockOf, dayActivities } from "@/lib/plan";
import { mealMacros } from "@/lib/nutrition";
import { dayLog, editDay, update, useApp } from "@/lib/store";
import { Bar, Btn, Card, CheckRow, Page, Ring, SectionTitle, Tag } from "@/components/ui-kit";
import { HipWarning, SwimWarning } from "@/components/SessionView";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Hoy · OPERATOR" }, { name: "description", content: "Tu día: sesión, comidas, sueño y hábitos." }, { property: "og:title", content: "Hoy · OPERATOR" }, { property: "og:description", content: "Panel diario de rendimiento." }] }),
  component: Home,
});

function Home() {
  const s = useApp();
  const t = todayLocal();
  const k = toKey(t);
  const log = dayLog(s, k);
  const before = diffDays(START, t);
  const h = new Date().getHours();
  const greet = h < 13 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
  const acts = dayActivities(before > 0 ? START : t, s.settings, s.routines).filter((a) => a.type !== "rest");
  const nextAct = before > 0 ? acts[0] : acts.find((a) => !log.done?.[a.id]);
  const nextKey = before > 0 ? toKey(START) : k;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const nextMeal = s.menu.find((m) => !log.meals?.[m.id]);
  const eaten = s.menu.filter((m) => log.meals?.[m.id]).reduce((a, m) => a + mealMacros(m, log.portion?.[m.id] ?? 1).kcal, 0);
  const trainDone = acts.length === 0 || acts.every((a) => log.done?.[a.id]);
  const sleepOk = (log.sleep ?? 0) >= s.settings.sleepTarget - 0.5;
  const checks = s.menu.length + 2;
  const doneN = s.menu.filter((m) => log.meals?.[m.id]).length + (trainDone ? 1 : 0) + (sleepOk ? 1 : 0);
  const w = weekIndex(t);

  return (
    <Page title={`${greet}${s.settings.name ? `, ${s.settings.name}` : ""}`} subtitle={fmtLong(t)}>
      {before > 0 ? (
        <Card className="bg-primary/10">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Cuenta atrás</div>
          <div className="num mt-1 text-5xl font-bold">{before}<span className="ml-2 text-lg text-muted-foreground">días</span></div>
          <p className="mt-1 text-sm text-muted-foreground">El plan empieza el lunes 2 nov 2026. Vista previa de la semana 1:</p>
          <ul className="mt-3 space-y-1 text-sm">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(START, i);
              const a = dayActivities(d, s.settings, s.routines);
              return <li key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{DAY_NAMES[i]}</span><span className="truncate text-right">{a.map((x) => x.title.split(" ·")[0]).join(", ")} <span className="num text-muted-foreground">{a[0].start ?? ""}</span></span></li>;
            })}
          </ul>
        </Card>
      ) : w < 52 && (
        <p className="text-sm text-muted-foreground">Semana {w + 1}/52 · {BLOCKS[blockOf(w)].name}</p>
      )}

      <Card>
        <div className="flex items-center gap-4">
          <Ring value={doneN / checks} size={72}><span className="num text-sm font-bold">{doneN}/{checks}</span></Ring>
          <div className="min-w-0">
            <div className="font-semibold">Hábitos de hoy</div>
            <div className="text-xs text-muted-foreground">5 comidas + entreno + sueño</div>
          </div>
        </div>
      </Card>

      {nextAct && (
        <Card>
          <SectionTitle>Próxima actividad</SectionTitle>
          <div className="text-lg font-semibold">{nextAct.title}</div>
          <div className="num text-sm text-muted-foreground">{before > 0 ? "Lun 2 nov · " : ""}{nextAct.start}–{nextAct.end}</div>
          <Link to="/sesion/$date" params={{ date: nextKey }} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">Ver sesión</Link>
        </Card>
      )}

      {nextMeal && (
        <Card>
          <SectionTitle right={<span className="num text-xs text-muted-foreground">{nextMeal.time}</span>}>Siguiente comida</SectionTitle>
          <div className="font-semibold">{nextMeal.name}</div>
          <div className="text-xs text-muted-foreground">{nextMeal.items.map((i) => i.food).join(" · ")} · ~{Math.round(mealMacros(nextMeal).kcal)} kcal <Tag kind="est" /></div>
          <Btn className="mt-3 w-full" onClick={() => editDay(k, (l) => { l.meals ||= {}; l.meals[nextMeal.id] = true; })}>{nextMeal.action}</Btn>
          {nowMin > 0 && null}
        </Card>
      )}

      <Card>
        <SectionTitle>Checklist</SectionTitle>
        {s.menu.map((m) => (
          <CheckRow key={m.id} done={!!log.meals?.[m.id]} onToggle={() => editDay(k, (l) => { l.meals ||= {}; l.meals[m.id] = !l.meals[m.id]; })} label={m.name} sub={m.time} />
        ))}
        <CheckRow done={trainDone && acts.length > 0} onToggle={() => editDay(k, (l) => { l.done ||= {}; acts.forEach((a) => (l.done![a.id] = !trainDone)); })} label="Entreno" sub={acts.length ? acts.map((a) => a.title).join(", ") : "Descanso"} />
        <CheckRow done={sleepOk} onToggle={() => editDay(k, (l) => (l.sleep = sleepOk ? undefined : s.settings.sleepTarget))} label={`Sueño ≥ ${s.settings.sleepTarget} h`} sub={`Acostarse ${s.settings.bed}`} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-muted-foreground">Sueño anoche <Tag kind="real" /></div>
          <div className="mt-2 flex items-center gap-1">
            <input inputMode="decimal" className="field num text-xl font-bold" value={log.sleep ?? ""} placeholder="—" onChange={(e) => editDay(k, (l) => (l.sleep = e.target.value === "" ? undefined : Number(e.target.value.replace(",", "."))))} />
            <span className="text-sm text-muted-foreground">h</span>
          </div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground">Peso hoy <Tag kind="real" /></div>
          <div className="mt-2 flex items-center gap-1">
            <input inputMode="decimal" className="field num text-xl font-bold" value={s.weights[k] ?? ""} placeholder="—" onChange={(e) => update((st) => { const v = Number(e.target.value.replace(",", ".")); if (e.target.value === "" || isNaN(v)) delete st.weights[k]; else st.weights[k] = v; })} />
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle right={<Tag kind="est" />}>Energía consumida</SectionTitle>
        <div className="num mb-2 text-2xl font-bold">{Math.round(eaten)} <span className="text-sm text-muted-foreground">/ {s.settings.kcal} kcal</span></div>
        <Bar value={eaten} max={s.settings.kcal} className="bg-food" />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Agua <span className="num text-foreground">{(log.water ?? 0).toFixed(2)} / {s.settings.waterL} L</span></span>
          <Btn variant="soft" onClick={() => editDay(k, (l) => (l.water = (l.water ?? 0) + 0.25))}>+250 ml</Btn>
        </div>
      </Card>

      <HipWarning />
      <SwimWarning />
    </Page>
  );
}
