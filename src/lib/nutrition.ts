// Valores aproximados por 100 g/ml (o por unidad). ESTIMADOS, no exactos.
export type Food = { name: string; unit: "g" | "ml" | "ud"; kcal: number; p: number; f: number; c: number; gPerUnit?: number; alt?: string };
export const FOODS: Record<string, Food> = {
  avena: { name: "Avena", unit: "g", kcal: 380, p: 13, f: 7, c: 60, alt: "Copos de trigo/espelta" },
  leche: { name: "Leche entera", unit: "ml", kcal: 64, p: 3.3, f: 3.6, c: 4.8, alt: "Bebida de soja" },
  platano: { name: "Plátano", unit: "ud", kcal: 105, p: 1.3, f: 0.4, c: 27, gPerUnit: 120, alt: "Manzana o pera" },
  cacahuete: { name: "Crema de cacahuete", unit: "g", kcal: 600, p: 25, f: 50, c: 16, alt: "Frutos secos" },
  pan: { name: "Pan", unit: "g", kcal: 265, p: 9, f: 3, c: 49, alt: "Pan integral / tortitas" },
  pavo: { name: "Pavo (fiambre)", unit: "g", kcal: 105, p: 19, f: 2, c: 2, alt: "Jamón cocido" },
  queso: { name: "Queso", unit: "g", kcal: 350, p: 25, f: 27, c: 2, alt: "Queso fresco batido" },
  tomate: { name: "Tomate", unit: "g", kcal: 18, p: 0.9, f: 0.2, c: 3.9 },
  arroz: { name: "Arroz (seco)", unit: "g", kcal: 360, p: 7, f: 0.7, c: 79, alt: "Patata (×4 en peso) o quinoa" },
  pollo: { name: "Pollo (crudo)", unit: "g", kcal: 120, p: 22, f: 3, c: 0, alt: "Pavo, ternera magra" },
  verduras: { name: "Verduras", unit: "g", kcal: 30, p: 2, f: 0.3, c: 5, alt: "Congeladas salteadas" },
  aove: { name: "AOVE", unit: "g", kcal: 884, p: 0, f: 100, c: 0 },
  yogur: { name: "Yogur", unit: "g", kcal: 61, p: 3.5, f: 3.3, c: 4.7, alt: "Yogur griego / skyr" },
  cereales: { name: "Cereales", unit: "g", kcal: 380, p: 7, f: 2, c: 84, alt: "Granola sin azúcar" },
  fruta: { name: "Fruta", unit: "ud", kcal: 75, p: 0.8, f: 0.3, c: 18, gPerUnit: 150 },
  pasta: { name: "Pasta (seca)", unit: "g", kcal: 360, p: 13, f: 1.5, c: 72, alt: "Arroz, cuscús" },
  atun: { name: "Atún (escurrido)", unit: "g", kcal: 130, p: 27, f: 2, c: 0, alt: "Pollo, huevos" },
  tomatetrit: { name: "Tomate triturado", unit: "g", kcal: 32, p: 1.5, f: 0.2, c: 5.5 },
  huevo: { name: "Huevo", unit: "ud", kcal: 75, p: 6.5, f: 5, c: 0.5, gPerUnit: 60 },
};

export type MealItem = { food: string; qty: number };
export type Meal = { id: string; time: string; name: string; action: string; items: MealItem[] };

export const DEFAULT_MENU: Meal[] = [
  { id: "m1", time: "06:10", name: "Desayuno", action: "He desayunado", items: [{ food: "avena", qty: 70 }, { food: "leche", qty: 250 }, { food: "platano", qty: 1 }, { food: "cacahuete", qty: 10 }] },
  { id: "m2", time: "10:30", name: "Media mañana", action: "He tomado media mañana", items: [{ food: "pan", qty: 100 }, { food: "pavo", qty: 50 }, { food: "queso", qty: 20 }, { food: "tomate", qty: 80 }] },
  { id: "m3", time: "13:30", name: "Comida", action: "He comido", items: [{ food: "arroz", qty: 120 }, { food: "pollo", qty: 120 }, { food: "verduras", qty: 200 }, { food: "aove", qty: 15 }] },
  { id: "m4", time: "15:45", name: "Merienda pre-entreno", action: "He merendado", items: [{ food: "yogur", qty: 125 }, { food: "cereales", qty: 50 }, { food: "fruta", qty: 1 }] },
  { id: "m5", time: "19:00", name: "Cena", action: "He cenado", items: [{ food: "pasta", qty: 110 }, { food: "atun", qty: 80 }, { food: "tomatetrit", qty: 150 }, { food: "aove", qty: 15 }] },
];

export type Macros = { kcal: number; p: number; f: number; c: number };
export const ZERO: Macros = { kcal: 0, p: 0, f: 0, c: 0 };
export function itemMacros(it: MealItem): Macros {
  const f = FOODS[it.food];
  if (!f) return ZERO;
  const k = f.unit === "ud" ? it.qty : it.qty / 100;
  return { kcal: f.kcal * k, p: f.p * k, f: f.f * k, c: f.c * k };
}
export const add = (a: Macros, b: Macros, m = 1): Macros => ({ kcal: a.kcal + b.kcal * m, p: a.p + b.p * m, f: a.f + b.f * m, c: a.c + b.c * m });
export const mealMacros = (m: Meal, factor = 1) => m.items.reduce((acc, it) => add(acc, itemMacros(it), factor), ZERO);
export const menuMacros = (menu: Meal[]) => menu.reduce((acc, m) => add(acc, mealMacros(m)), ZERO);
export const macroKcal = (p: number, f: number, c: number) => p * 4 + f * 9 + c * 4;

export function shoppingList(menu: Meal[], days = 7) {
  const totals: Record<string, number> = {};
  menu.forEach((m) => m.items.forEach((it) => (totals[it.food] = (totals[it.food] || 0) + it.qty * days)));
  return Object.entries(totals).map(([food, qty]) => ({ food, qty, f: FOODS[food] }));
}

/** Media semanal de peso; sugiere +150-200 kcal si estancado 2-3 semanas. */
export function weeklyAverages(weights: Record<string, number>) {
  const byWeek: Record<string, number[]> = {};
  Object.entries(weights).forEach(([k, v]) => {
    const [y, m, d] = k.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const mon = new Date(dt);
    mon.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
    const wk = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
    (byWeek[wk] ||= []).push(v);
  });
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, arr]) => ({ week, avg: arr.reduce((s, x) => s + x, 0) / arr.length, n: arr.length }));
}
export function kcalAdvice(avgs: { avg: number }[]): string | null {
  if (avgs.length < 3) return null;
  const last = avgs.slice(-3);
  if (last[2].avg - last[0].avg < 0.2) return "Peso medio estancado 2-3 semanas: valora subir +150-200 kcal (p. ej. +40 g de hidratos o un puñado de frutos secos).";
  return null;
}
