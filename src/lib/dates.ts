export const START = new Date(2026, 10, 2); // lunes 2 nov 2026
export const END = new Date(2027, 9, 31); // domingo 31 oct 2027
export const TOTAL_WEEKS = 52;

const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};
export const diffDays = (a: Date, b: Date) =>
  Math.round(
    (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
      Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) /
      86400000,
  );
/** 0-based week index from START (negative before start). */
export const weekIndex = (d: Date) => Math.floor(diffDays(d, START) / 7);
/** 0 = lunes ... 6 = domingo */
export const dow = (d: Date) => (d.getDay() + 6) % 7;
export const startOfWeek = (d: Date) => addDays(d, -dow(d));
export const todayLocal = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
export const inRange = (d: Date) => diffDays(d, START) >= 0 && diffDays(END, d) >= 0;

export const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

export const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
export const fmtShort = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
export const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
