import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { fmtShort, fromKey, toKey, todayLocal } from "@/lib/dates";
import { weeklyAverages } from "@/lib/nutrition";
import { update, useApp, type TestEntry } from "@/lib/store";
import { BarChart, Btn, Card, Empty, LineChart, Page, SectionTitle, Tag } from "@/components/ui-kit";

export const Route = createFileRoute("/progreso")({
  head: () => ({ meta: [{ title: "Progreso · OPERATOR" }, { name: "description", content: "Gráficas reales de peso, cargas, sueño y pruebas." }, { property: "og:title", content: "Progreso · OPERATOR" }, { property: "og:description", content: "Solo datos registrados." }] }),
  component: Progreso,
});

const FIELDS: { k: keyof TestEntry; l: string; t?: "text" }[] = [
  { k: "weight", l: "Peso medio (kg)" }, { k: "pullups", l: "Dominadas" }, { k: "pushups2", l: "Flexiones 2 min" },
  { k: "situps2", l: "Abdominales 2 min" }, { k: "run2400", l: "2.4 km (mm:ss, si preparado)", t: "text" },
  { k: "swimM", l: "Nado continuo (m)" }, { k: "swim457", l: "457 m (solo técnica segura)", t: "text" },
  { k: "sleepAvg", l: "Sueño medio (h)" }, { k: "energy", l: "Energía (0-10)" }, { k: "pain", l: "Molestias", t: "text" },
];

function Progreso() {
  const s = useApp();
  const [form, setForm] = useState<Record<string, string>>({});
  const wavg = weeklyAverages(s.weights).map((w) => ({ label: fmtShort(fromKey(w.week)), y: w.avg }));
  const lift = (ids: string[]) =>
    Object.entries(s.logs).sort(([a], [b]) => a.localeCompare(b)).flatMap(([k, l]) => {
      const sets = ids.flatMap((id) => l.sets?.[id] || []).filter((x) => x.done && Number(x.w) > 0);
      return sets.length ? [{ label: fmtShort(fromKey(k)), y: Math.max(...sets.map((x) => Number(x.w))) }] : [];
    });
  const sleep = Object.entries(s.logs).filter(([, l]) => l.sleep != null).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([k, l]) => ({ label: String(fromKey(k).getDate()), y: l.sleep! }));

  const save = () => {
    const e: TestEntry = { id: String(Date.now()), date: form.date || toKey(todayLocal()) };
    FIELDS.forEach(({ k, t }) => { const v = form[k]; if (v) (e as Record<string, unknown>)[k] = t ? v : Number(v.replace(",", ".")); });
    update((st) => st.tests.push(e));
    setForm({});
  };

  return (
    <Page title="Progreso" subtitle="Solo datos registrados">
      <Card><SectionTitle right={<Tag kind="real" />}>Peso medio semanal</SectionTitle><LineChart data={wavg} unit=" kg" /></Card>
      {([["Peso muerto", ["dl"]], ["Press banca", ["bench"]], ["Banca pausa", ["pause"]], ["Sentadilla", ["squat"]]] as const).map(([n, ids]) => (
        <Card key={n}><SectionTitle right={<Tag kind="real" />}>{n} · serie más pesada (kg)</SectionTitle><LineChart data={lift([...ids])} unit=" kg" /></Card>
      ))}
      <Card><SectionTitle right={<Tag kind="real" />}>Sueño (últimos 14 registros)</SectionTitle><BarChart data={sleep} target={s.settings.sleepTarget} /></Card>
      <Card>
        <SectionTitle>Pruebas mensuales</SectionTitle>
        {s.tests.length === 0 ? <Empty>Aún no hay pruebas. Registra la primera al final de cada mes.</Empty> : (
          <div className="space-y-2">
            {[...s.tests].reverse().map((t) => (
              <div key={t.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                <div className="mb-1 flex justify-between"><span className="font-semibold">{fmtShort(fromKey(t.date))}</span><button aria-label="Borrar" onClick={() => update((st) => (st.tests = st.tests.filter((x) => x.id !== t.id)))} className="text-destructive"><Trash2 className="h-4 w-4" /></button></div>
                <div className="num grid grid-cols-2 gap-x-3 text-xs text-muted-foreground">
                  {FIELDS.filter((f) => t[f.k] != null).map((f) => <span key={f.k}>{f.l.split(" (")[0]}: <span className="text-foreground">{String(t[f.k])}</span></span>)}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="col-span-2 text-xs text-muted-foreground">Fecha<input type="date" className="field mt-1" value={form.date || toKey(todayLocal())} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          {FIELDS.map((f) => (
            <label key={f.k} className="min-w-0 text-xs text-muted-foreground">{f.l}
              <input inputMode={f.t ? "text" : "decimal"} className="field num mt-1" value={form[f.k] || ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
            </label>
          ))}
        </div>
        <Btn className="mt-3 w-full" onClick={save}>Guardar prueba</Btn>
      </Card>
    </Page>
  );
}
