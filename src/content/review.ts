import type { Localized } from "../i18n.ts";

export type ReviewEntry = {
  slug: string;
  title: Localized;
  available: boolean;
};

export const reviewCatalog: ReviewEntry[] = [
  {
    slug: "sampling",
    title: { pt: "Amostragem", en: "Sampling" },
    available: false,
  },
  {
    slug: "nyquist",
    title: {
      pt: "Nyquist e o teorema da amostragem",
      en: "Nyquist and the sampling theorem",
    },
    available: false,
  },
  {
    slug: "dtft",
    title: { pt: "DTFT e espectro", en: "DTFT and spectrum" },
    available: false,
  },
  {
    slug: "dft-fft",
    title: { pt: "DFT e FFT", en: "DFT and FFT" },
    available: false,
  },
  {
    slug: "fir-design",
    title: { pt: "Projeto de filtros FIR", en: "FIR filter design" },
    available: false,
  },
];
