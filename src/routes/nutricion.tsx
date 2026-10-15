import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toKey, todayLocal, fmtLong, fromKey } from "@/lib/dates";
import { FOODS, kcalAdvice, macroKcal, mealMacros, menuMacros, shoppingList, weeklyAverages, add, ZERO } from "@/lib/nutrition";
import { dayLog, editDay, update, useApp } from "@/lib/store";
import { Bar, Btn, Card, CheckRow, Page, SectionTitle, Tag, Warn } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nutricion")({
  head: () => ({ meta: [{ title: "Nutrición · OPERATOR" }, { name: "description", content: "Plan de comidas, registro, agua y lista de compra." }, { property: "og:title", content: "Nutrición · OPERATOR" }, { property: "og:description", content: "Menú base ~2800 kcal estimadas." }] }),
  component: Nutricion,
});

function Nutricion() {
  const s = useApp();
  const [tab, setTab] = useState<"dia" | "menu" | "compra">("dia");
  const [k, setK] = useState(toKey(todayLocal()));
  const log = dayLog(s, k);
  const eaten = s.menu.filter((m) => log.meals?.[m.id]).reduce((a, m) => add(a, mealMacros(m, log.portion?.[m.id] ?? 1)), ZERO);
  const st = s.settings;
  const advice = kcalAdvice(weeklyAverages(s.weights));
  const base = menuMacros(s.menu);

  return (
    <Page title="Nutrición" subtitle="Macros = referencia">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {(["dia", "menu", "compra"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("min-h-10 rounded-lg text-sm font-semibold", tab === t ? "bg-card text-foreground" : "text-muted-foreground")}>{{ dia: "Día", menu: "Menú base", compra: "Compra" }[t]}</button>
        ))}
      </div>

      {tab === "dia" && <>
        <Card>
          <div className="flex items-center justify-between gap-2">
            <input type="date" className="field w-auto" value={k} onChange={(e) => e.target.value && setK(e.target.value)} />
            <span className="truncate text-xs text-muted-foreground">{fmtLong(fromKey(k))}</span>
          </div>
          <div className="mt-4 space-y-3">
            {([["Energía", eaten.kcal, st.kcal, "kcal", "bg-food"], ["Proteína", eaten.p, st.protein, "g", "bg-primary"], ["Grasa", eaten.f, st.fat, "g", "bg-warning"], ["Hidratos", eaten.c, st.carbs, "g", "bg-swim"]] as const).map(([l, v, m, u, c]) => (
              <div key={l}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="num">{Math.round(v)} / {m} {u}</span></div>
                <Bar value={v} max={m} className={c} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground"><Tag kind="est" /> Cifras estimadas a partir de raciones típicas. El menú puede variar; no hace falta pesar todo.</p>
        </Card>
        <Card>
          <SectionTitle>Comidas</SectionTitle>
          {s.menu.map((m) => {
            const f = log.portion?.[m.id] ?? 1;
            return (
              <div key={m.id} className="border-b py-2 last:border-0">
                <CheckRow done={!!log.meals?.[m.id]} onToggle={() => editDay(k, (l) => { l.meals ||= {}; l.meals[m.id] = !l.meals[m.id]; })}
                  label={<span>{m.name} <span className="num text-xs text-muted-foreground">{m.time}</span></span>}
                  sub={`${m.items.map((i) => `${Math.round(i.qty * f)}${FOODS[i.food]?.unit === "ud" ? " ud" : FOODS[i.food]?.unit} ${FOODS[i.food]?.name}`).join(" · ")} · ~${Math.round(mealMacros(m, f).kcal)} kcal`} />
                <div className="mt-1 flex gap-1 pl-10">
                  {[0.5, 0.75, 1, 1.25].map((p) => (
                    <button key={p} onClick={() => editDay(k, (l) => { l.portion ||= {}; l.portion[m.id] = p; })} className={cn("num rounded-md px-2 py-1 text-[11px]", f === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>×{p}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <SectionTitle right={<span className="num text-sm">{(log.water ?? 0).toFixed(2)} / {st.waterL} L</span>}>Agua</SectionTitle>
          <Bar value={log.water ?? 0} max={st.waterL} className="bg-swim" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Btn variant="soft" onClick={() => editDay(k, (l) => (l.water = Math.max(0, (l.water ?? 0) - 0.25)))}>−250</Btn>
            <Btn variant="soft" onClick={() => editDay(k, (l) => (l.water = (l.water ?? 0) + 0.25))}>+250 ml</Btn>
            <Btn variant="soft" onClick={() => editDay(k, (l) => (l.water = (l.water ?? 0) + 0.5))}>+500 ml</Btn>
          </div>
        </Card>
        {advice ? <Warn>{advice}</Warn> : <p className="text-xs text-muted-foreground">Objetivo a largo plazo: 68-71 kg de forma gradual (no garantizado). Si comes irregular, sube hacia 2800 kcal poco a poco. Registra el peso en Hoy para ver la media semanal.</p>}
      </>}

      {tab === "menu" && <>
        <Card>
          <SectionTitle right={<Tag kind="est" />}>Total menú base</SectionTitle>
          <div className="num text-2xl font-bold">~{Math.round(base.kcal)} kcal</div>
          <div className="num text-xs text-muted-foreground">P {Math.round(base.p)} g · G {Math.round(base.f)} g · HC {Math.round(base.c)} g</div>
          <p className="mt-2 text-xs text-muted-foreground">Objetivo de referencia: {st.protein} g P · {st.fat} g G · {st.carbs} g HC = {macroKcal(st.protein, st.fat, st.carbs)} kcal. Los macros de los platos son aproximados.</p>
        </Card>
        {s.menu.map((m, mi) => (
          <Card key={m.id}>
            <div className="mb-3 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
              <input type="time" className="field num" value={m.time} onChange={(e) => update((x) => (x.menu[mi].time = e.target.value))} />
              <input className="field font-semibold" value={m.name} onChange={(e) => update((x) => (x.menu[mi].name = e.target.value))} />
            </div>
            {m.items.map((it, ii) => (
              <div key={ii} className="mb-2 grid grid-cols-[minmax(0,1fr)_5rem_2rem] items-center gap-2">
                <select className="field text-sm" value={it.food} onChange={(e) => update((x) => (x.menu[mi].items[ii].food = e.target.value))}>
                  {Object.entries(FOODS).map(([id, f]) => <option key={id} value={id}>{f.name}</option>)}
                </select>
                <input inputMode="decimal" className="field num text-sm" value={it.qty} onChange={(e) => update((x) => (x.menu[mi].items[ii].qty = Number(e.target.value) || 0))} />
                <button aria-label="Quitar" onClick={() => update((x) => x.menu[mi].items.splice(ii, 1))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button className="text-xs text-primary" onClick={() => update((x) => x.menu[mi].items.push({ food: "fruta", qty: 1 }))}>+ Añadir alimento</button>
              <span className="num text-xs text-muted-foreground">~{Math.round(mealMacros(m).kcal)} kcal</span>
            </div>
          </Card>
        ))}
      </>}

      {tab === "compra" && <>
        <Card>
          <SectionTitle right={<Tag kind="est" />}>Lista semanal (7 días)</SectionTitle>
          {shoppingList(s.menu).map(({ food, qty, f }) => (
            <div key={food} className="flex justify-between gap-3 border-b py-2 text-sm last:border-0">
              <div className="min-w-0"><div>{f?.name}</div>{f?.alt && <div className="text-xs text-muted-foreground">Alt: {f.alt}</div>}</div>
              <span className="num shrink-0">{f?.unit === "ud" ? `${qty} ud` : qty >= 1000 ? `${(qty / 1000).toFixed(2)} ${f?.unit === "ml" ? "L" : "kg"}` : `${qty} ${f?.unit}`}</span>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle>Preparación de tuppers (domingo, ~60 min)</SectionTitle>
          <ul className="space-y-1.5 text-sm">
            <li>• Cocer 600 g de arroz seco (5 comidas L-V) y repartir en 5 tuppers.</li>
            <li>• Pollo a la plancha/horno: 600 g crudo, en 5 raciones.</li>
            <li>• 1 kg de verduras asadas o congeladas salteadas.</li>
            <li>• Pasta: cocer cada noche o en 2 tandas (aguanta 3 días en nevera).</li>
            <li>• Preparar bocadillos de media mañana la noche anterior.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Sin obsesión: marcar la comida como hecha basta. Ajustar solo según tendencia de peso semanal.</p>
        </Card>
      </>}
    </Page>
  );
}
