import type { Lab } from "./labTypes.ts";
import type { Localized } from "../i18n.ts";
import { lab0 } from "./lab0.ts";
import { lab1 } from "./lab1.ts";
import { lab2 } from "./lab2.ts";
import { lab3 } from "./lab3.ts";

export type LabCatalogEntry = {
  id: number;
  title: Localized;
  available: boolean;
};

export const labCatalog: LabCatalogEntry[] = [
  {
    id: 0,
    title: { pt: "A placa e o ambiente", en: "The board and the toolchain" },
    available: true,
  },
  {
    id: 1,
    title: { pt: "Chaves → LEDs", en: "Switches → LEDs" },
    available: true,
  },
  {
    id: 2,
    title: { pt: "Lógica sequencial: clock e contador", en: "Sequential logic: clock and counter" },
    available: true,
  },
  {
    id: 3,
    title: { pt: "Rumo ao DSP: um filtro FIR", en: "Toward DSP: a FIR filter" },
    available: true,
  },
];

// The labs whose data actually exists, keyed by id.
export const labs: Record<number, Lab> = {
  0: lab0,
  1: lab1,
  2: lab2,
  3: lab3,
};
