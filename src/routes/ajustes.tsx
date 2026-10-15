import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { getState, replaceState, resetState, update, useApp } from "@/lib/store";
import type { Settings } from "@/lib/plan";
import { macroKcal } from "@/lib/nutrition";
import { Btn, Card, CheckRow, Page, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes · OPERATOR" }, { name: "description", content: "Horarios, objetivos y copia de seguridad." }, { property: "og:title", content: "Ajustes · OPERATOR" }, { property: "og:description", content: "Personaliza tu plan." }] }),
  component: Ajustes,
});

function Ajustes() {
  const s = useApp().settings;
  const file = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => update((st) => { st.settings[k] = v; });
  const time = (k: keyof Settings, l: string) => (
    <label className="min-w-0 text-xs text-muted-foreground">{l}<input type="time" className="field num mt-1" value={String(s[k])} onChange={(e) => set(k, e.target.value as never)} /></label>
  );
  const num = (k: keyof Settings, l: string) => (
    <label className="min-w-0 text-xs text-muted-foreground">{l}<input inputMode="decimal" className="field num mt-1" value={String(s[k])} onChange={(e) => set(k, (Number(e.target.value.replace(",", ".")) || 0) as never)} /></label>
  );
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `operator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  return (
    <Page title="Ajustes" subtitle="Datos guardados en este dispositivo">
      <Card>
        <SectionTitle>Perfil</SectionTitle>
        <input className="field" placeholder="Tu nombre" value={s.name} onChange={(e) => set("name", e.target.value)} />
        <p className="mt-2 text-xs text-muted-foreground">184 cm · 63.2 kg inicial · 1RM PM 130 / banca 87.5 / sentadilla 92.5</p>
      </Card>
      <Card>
        <SectionTitle>Horarios</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {time("gymStart", "Gimnasio inicio")}{time("gymEnd", "Gimnasio fin")}
          {time("swimStart", "Natación inicio")}{time("swimEnd", "Natación fin")}
          {time("runStart", "Carrera inicio")}{time("runEnd", "Carrera fin")}
          {time("bed", "Acostarse")}{time("wake", "Despertar")}
        </div>
      </Card>
      <Card>
        <SectionTitle>Objetivos</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {num("kcal", "kcal/día")}{num("protein", "Proteína g")}{num("fat", "Grasa g")}{num("carbs", "Hidratos g")}{num("waterL", "Agua L")}{num("sleepTarget", "Sueño h")}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Macros suman {macroKcal(s.protein, s.fat, s.carbs)} kcal.</p>
        <div className="mt-3">
          <CheckRow done={s.secondRun} onToggle={() => set("secondRun", !s.secondRun)} label="Segunda carrera (desde diciembre)" sub="Solo si recuperación y nutrición lo permiten" />
          <CheckRow done={s.secondSwim} onToggle={() => set("secondSwim", !s.secondSwim)} label="Segunda natación (desde bloque 3)" sub="Opcional, piscina vigilada" />
        </div>
      </Card>
      <Card>
        <SectionTitle>Copia de seguridad</SectionTitle>
        <p className="mb-3 text-xs text-muted-foreground">Todo se guarda solo en este navegador. No hay sincronización entre dispositivos: exporta el JSON para guardarlo o moverlo.</p>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="soft" onClick={exportJson}>Exportar JSON</Btn>
          <Btn variant="soft" onClick={() => file.current?.click()}>Importar JSON</Btn>
        </div>
        <input ref={file} type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try { replaceState(JSON.parse(await f.text())); alert("Datos importados"); } catch { alert("Archivo no válido"); }
        }} />
        <Btn variant="danger" className="mt-2 w-full" onClick={() => confirm("¿Borrar todos los datos?") && resetState()}>Restablecer todo</Btn>
      </Card>
      <Card>
        <SectionTitle>Instalar en iPhone</SectionTitle>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Abre esta web en Safari.</li>
          <li>Pulsa el botón Compartir (cuadrado con flecha).</li>
          <li>Elige «Añadir a pantalla de inicio».</li>
          <li>Ábrela desde el icono: pantalla completa, sin barra de Safari.</li>
        </ol>
      </Card>
    </Page>
  );
}
