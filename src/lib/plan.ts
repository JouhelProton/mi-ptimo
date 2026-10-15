import { dow, weekIndex } from "./dates";

export type MainLift = "dl" | "bench" | "pause" | "squat";
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  load: string;
  rpe: string;
  notes: string;
  main?: MainLift;
};
export type RoutineKey = "pull" | "push" | "legs" | "upper";
export type Routines = Record<RoutineKey, { title: string; exercises: Exercise[] }>;

const ex = (id: string, name: string, sets: number, reps: string, load = "", rpe = "", notes = "", main?: MainLift): Exercise => ({
  id, name, sets, reps, load, rpe, notes, main,
});

export const DEFAULT_ROUTINES: Routines = {
  pull: {
    title: "Pull · Peso muerto",
    exercises: [
      ex("dl", "Peso muerto", 3, "5", "85", "7-8", "Técnica limpia, espalda neutra.", "dl"),
      ex("pullup", "Dominadas", 4, "5-7", "BW", "7-8", "Dejar 2-3 reps en recámara."),
      ex("latpull", "Jalón al pecho", 2, "10-12", "", "7"),
      ex("dbrow", "Remo con mancuerna", 3, "8-12", "", "7-8"),
      ex("wcurl-p", "Curl barra W", 2, "10-12", "", "8"),
      ex("facepull", "Face pull", 2, "15", "", "7"),
    ],
  },
  push: {
    title: "Push · Banca",
    exercises: [
      ex("bench", "Press banca", 4, "5", "57.5", "7-8", "", "bench"),
      ex("incdb", "Press inclinado mancuernas", 3, "8-10", "", "7-8"),
      ex("dips", "Fondos", 2, "6-10", "BW", "7-8"),
      ex("pecdeck", "Pec deck", 2, "12", "", "8"),
      ex("tri-u1", "Tríceps unilateral polea", 2, "12", "", "8"),
      ex("pushup", "Flexiones", 2, "12-18", "BW", "7"),
    ],
  },
  legs: {
    title: "Piernas",
    exercises: [
      ex("squat", "Sentadilla", 3, "5", "", "", "SOLO sin dolor y tras valoración profesional. Sin carga prescrita.", "squat"),
      ex("legpress", "Prensa", 3, "10", "", "7"),
      ex("legext", "Extensión cuádriceps", 2, "12", "", "8"),
      ex("legcurl", "Curl isquios", 3, "10-12", "", "8"),
      ex("abduct", "Abductores", 2, "15", "", "7"),
      ex("calves", "Gemelos", 3, "12-15", "", "8"),
      ex("sideplank", "Plancha lateral", 2, "30s", "BW", ""),
    ],
  },
  upper: {
    title: "Banca pausa · Hombros · Brazos",
    exercises: [
      ex("pause", "Press banca con pausa", 3, "6", "50", "7", "Pausa 1-2 s en el pecho.", "pause"),
      ex("ohp", "Press militar barra", 3, "6-8", "", "7-8"),
      ex("lateral", "Elevaciones laterales", 3, "12-15", "", "8"),
      ex("wcurl-u", "Curl barra W", 2, "10-12", "", "8"),
      ex("ropecurl", "Curl martillo cuerda", 2, "12", "", "8"),
      ex("tri-u2", "Tríceps unilateral polea", 2, "12", "", "8"),
      ex("abs", "Abdominales", 3, "15-20", "BW", ""),
    ],
  },
};

/** Noviembre (semanas 1-4): cargas exactas del plan. Semana 4 = descarga. */
export const NOV_PROGRESSION: Record<"dl" | "bench" | "pause", { loads: number[]; deloadSets: number; deloadReps: string }> = {
  dl: { loads: [85, 87.5, 90, 75], deloadSets: 2, deloadReps: "5" },
  bench: { loads: [57.5, 60, 62.5, 52.5], deloadSets: 2, deloadReps: "5" },
  pause: { loads: [50, 52.5, 55, 45], deloadSets: 2, deloadReps: "6" },
};

export const isDeload = (week: number) => week >= 0 && week % 4 === 3;

export type Prescription = { sets: number; reps: string; load: string; note?: string };
export function prescribe(e: Exercise, week: number): Prescription {
  if (e.main === "squat") return { sets: e.sets, reps: e.reps, load: "Sin prescribir", note: "Solo si no hay dolor y tras valoración." };
  if (e.main && e.main !== "squat" && week >= 0 && week <= 3) {
    const p = NOV_PROGRESSION[e.main];
    if (week === 3) return { sets: p.deloadSets, reps: p.deloadReps, load: String(p.loads[3]), note: "Descarga" };
    return { sets: e.sets, reps: e.reps, load: String(p.loads[week]) };
  }
  if (isDeload(week)) {
    return { sets: Math.max(2, e.sets - 1), reps: e.reps, load: e.load, note: "Descarga: −10-15% carga y menos series" };
  }
  return {
    sets: e.sets, reps: e.reps, load: e.load,
    note: e.main ? "Progresión conservadora: +2.5 kg solo si RPE ≤ 7-8, buena técnica y recuperación." : undefined,
  };
}

export const BLOCKS = [
  { name: "Adaptación", desc: "Cargas fijadas de noviembre, 1 carrera y 1 natación técnica por semana. Crear hábito de sueño y 5 comidas." },
  { name: "Segunda carrera", desc: "Segunda carrera suave opcional solo si recuperación y nutrición van bien. Básicos con progresión conservadora." },
  { name: "Natación 25-50 m", desc: "Técnica de respiración en piscina vigilada: pasar de 25 a 50 m continuos. Segunda natación opcional." },
  { name: "Carrera continua", desc: "Reducir pausas: objetivo 25-35 min continuos a ritmo conversacional." },
  { name: "Intervalos moderados", desc: "Una sesión con intervalos suaves (p. ej. 6×2 min). Nunca al fallo." },
  { name: "Consolidación", desc: "Mantener volumen, afianzar técnica en básicos y en el agua." },
  { name: "Resistencia muscular", desc: "Más trabajo de dominadas, flexiones y core con rangos altos." },
  { name: "Rodajes largos", desc: "Alargar el rodaje del sábado de forma gradual (+5 min/semana como máximo)." },
  { name: "Volumen piscina", desc: "Más metros totales con descansos; técnica primero, siempre supervisado." },
  { name: "Pruebas", desc: "Tests controlados de las pruebas mensuales, solo si hay preparación." },
  { name: "Mejora de marcas", desc: "Intentar mejorar marcas con margen y sin dolor." },
  { name: "Simulaciones seguras", desc: "Simulacros de pruebas en condiciones seguras, con descanso previo." },
  { name: "Taper / test final", desc: "Reducir volumen, llegar fresco y hacer el test final." },
];
export const blockOf = (week: number) => Math.min(12, Math.max(0, Math.floor(week / 4)));

export type Settings = {
  name: string;
  gymStart: string; gymEnd: string;
  swimStart: string; swimEnd: string;
  runStart: string; runEnd: string;
  wake: string; bed: string; sleepTarget: number;
  kcal: number; protein: number; fat: number; carbs: number; waterL: number;
  secondRun: boolean; secondSwim: boolean;
};
export const DEFAULT_SETTINGS: Settings = {
  name: "", gymStart: "16:15", gymEnd: "17:30", swimStart: "16:30", swimEnd: "17:15",
  runStart: "09:00", runEnd: "09:45", wake: "06:00", bed: "21:30", sleepTarget: 8,
  kcal: 2800, protein: 120, fat: 80, carbs: 400, waterL: 2.5, secondRun: false, secondSwim: false,
};

export type Activity = {
  id: string;
  type: "gym" | "swim" | "run" | "rest";
  routine?: RoutineKey;
  title: string;
  start?: string;
  end?: string;
  optional?: boolean;
};

const GYM_BY_DOW: Record<number, RoutineKey> = { 0: "pull", 1: "push", 3: "legs", 4: "upper" };

export function dayActivities(d: Date, s: Settings, routines: Routines): Activity[] {
  const w = Math.max(0, weekIndex(d));
  const day = dow(d);
  const acts: Activity[] = [];
  const r = GYM_BY_DOW[day];
  if (r) acts.push({ id: "gym", type: "gym", routine: r, title: routines[r].title, start: s.gymStart, end: s.gymEnd });
  if (day === 2) acts.push({ id: "swim", type: "swim", title: "Natación técnica · piscina vigilada", start: s.swimStart, end: s.swimEnd });
  if (day === 5) acts.push({ id: "run", type: "run", title: "Carrera suave", start: s.runStart, end: s.runEnd });
  // Segunda carrera: solo desde diciembre (semana 5+) y si está activada
  if (day === 6 && s.secondRun && w >= 4)
    acts.push({ id: "run2", type: "run", title: "Rodaje suave (opcional)", start: "10:00", end: "10:35", optional: true });
  // Segunda natación: desde bloque 3 y si está activada
  if (day === 5 && s.secondSwim && w >= 8)
    acts.push({ id: "swim2", type: "swim", title: "Natación técnica (opcional)", start: "17:00", end: "17:45", optional: true });
  if (acts.length === 0) acts.push({ id: "rest", type: "rest", title: "Descanso" });
  return acts;
}

export function runGuide(week: number): string[] {
  const b = blockOf(week);
  if (b === 0) return ["5 min caminando", "25-35 min trote muy suave, caminar cuando haga falta", "Ritmo conversacional (RPE 4-5)", "5 min caminando + movilidad suave"];
  if (b <= 2) return ["Calentamiento 5-8 min", "30-40 min suave con mínimas pausas", "Si hay fatiga, reducir duración"];
  if (b === 4) return ["Calentamiento 10 min", "6×2 min moderado / 2 min suave", "Vuelta a la calma 8 min"];
  return ["Calentamiento 10 min", "Rodaje continuo progresivo según bloque", "Nunca aumentar más de ~10% semanal"];
}
export function swimGuide(week: number): string[] {
  const b = blockOf(week);
  const base = ["Solo en piscina con socorrista. Nunca mar en solitario.", "Sin apnea ni hiperventilación: respirar con calma."];
  if (b < 2) return [...base, "Burbujas y exhalación bajo el agua 5 min", "Patada con tabla 6×25 m, descansos amplios", "Crol respirando cada 2 brazadas 4×12-25 m", "Considerar clases de técnica"];
  return [...base, "Técnica 10 min", "Series 25-50 m continuos con descanso completo", "Terminar antes de perder técnica"];
}
