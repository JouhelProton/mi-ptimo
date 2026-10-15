import { describe, expect, it } from "vitest";
import { DEFAULT_ROUTINES, prescribe } from "@/lib/plan";
import { macroKcal } from "@/lib/nutrition";

const find = (id: string) => Object.values(DEFAULT_ROUTINES).flatMap((r) => r.exercises).find((e) => e.id === id)!;

describe("progresión noviembre", () => {
  it("peso muerto 85/87.5/90/75 con descarga 2x5", () => {
    expect([0, 1, 2, 3].map((w) => prescribe(find("dl"), w).load)).toEqual(["85", "87.5", "90", "75"]);
    expect(prescribe(find("dl"), 3).sets).toBe(2);
  });
  it("banca pausa semana 4 2x6 a 45", () => {
    expect(prescribe(find("pause"), 3)).toMatchObject({ sets: 2, reps: "6", load: "45" });
  });
  it("sentadilla nunca tiene carga prescrita", () => {
    expect(prescribe(find("squat"), 1).load).toBe("Sin prescribir");
  });
  it("macros objetivo suman 2800", () => {
    expect(macroKcal(120, 80, 400)).toBe(2800);
  });
});
