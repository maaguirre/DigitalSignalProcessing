import type { Lecture } from "./types.ts";
import type { Localized } from "../i18n.ts";
import { lecture1 } from "./lecture1.ts";
import { lecture2 } from "./lecture2.ts";
import { lecture3 } from "./lecture3.ts";
import { lecture4 } from "./lecture4.ts";
import { lecture5 } from "./lecture5.ts";
import { lecture6 } from "./lecture6.ts";

export type CatalogEntry = {
  id: number;
  title: Localized;
  available: boolean;
};

export const lectureCatalog: CatalogEntry[] = [
  {
    id: 1,
    title: { pt: "Por que mudar a taxa?", en: "Why change the rate?" },
    available: true,
  },
  {
    id: 2,
    title: {
      pt: "O downsampler ↓D e o aliasing",
      en: "The ↓D downsampler and aliasing",
    },
    available: true,
  },
  {
    id: 3,
    title: { pt: "O decimador ideal", en: "The ideal decimator" },
    available: true,
  },
  {
    id: 4,
    title: { pt: "Upsampler ↑I e imaging", en: "Upsampler ↑I and imaging" },
    available: true,
  },
  {
    id: 5,
    title: { pt: "Conversão racional I/D", en: "Rational I/D conversion" },
    available: true,
  },
  {
    id: 6,
    title: { pt: "Projeto FIR: casos inteiros", en: "FIR design: integer cases" },
    available: true,
  },
  {
    id: 7,
    title: { pt: "FIR racional + forma direta", en: "Rational FIR + direct form" },
    available: false,
  },
  {
    id: 8,
    title: { pt: "Estruturas polifásicas", en: "Polyphase structures" },
    available: false,
  },
];

// The lectures whose data actually exists, keyed by id.
export const lectures: Record<number, Lecture> = {
  1: lecture1,
  2: lecture2,
  3: lecture3,
  4: lecture4,
  5: lecture5,
  6: lecture6,
};
