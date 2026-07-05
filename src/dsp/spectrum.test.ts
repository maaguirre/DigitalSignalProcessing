import { describe, it, expect } from "vitest";
import { magnitudeSpectrum } from "./spectrum.ts";
import { generateSine } from "./signals.ts";

describe("magnitudeSpectrum", () => {
  it("the frequency axis runs 0 to Nyquist (fs/2) with N/2+1 bins", () => {
    const fs = 8;
    const signal = generateSine(2, fs, 8);
    const { frequencies, magnitudes } = magnitudeSpectrum(signal, fs);
    expect(frequencies).toHaveLength(5);
    expect(magnitudes).toHaveLength(5);
    expect(frequencies[0]).toBeCloseTo(0, 10);
    expect(frequencies[4]).toBeCloseTo(fs / 2, 10);
  });

  it("a 2 Hz cosine produces a peak at the 2 Hz bin (magnitude ≈ A/2)", () => {
    const fs = 8;
    const amplitude = 1;
    const signal = generateSine(2, fs, 8, { amplitude });
    const { frequencies, magnitudes } = magnitudeSpectrum(signal, fs);

    const peakIdx = frequencies.findIndex((f) => Math.abs(f - 2) < 1e-9);
    expect(peakIdx).toBe(2);

    expect(magnitudes[peakIdx]).toBeCloseTo(amplitude / 2, 6);

    magnitudes.forEach((m, i) => {
      if (i !== peakIdx) expect(m).toBeCloseTo(0, 6);
    });
  });
});
