import { describe, it, expect } from "vitest";
import { generateSine, sumSines } from "./signals.ts";

describe("generateSine", () => {
  it("generates exactly numSamples samples", () => {
    const x = generateSine(1, 8, 16);
    expect(x).toHaveLength(16);
  });

  it("frequency 0 becomes a constant signal equal to the amplitude (cos 0 = 1)", () => {
    const x = generateSine(0, 8, 4, { amplitude: 3 });
    for (const sample of x) {
      expect(sample).toBeCloseTo(3, 10);
    }
  });

  it("honors amplitude and phase (φ = π negates the cosine)", () => {
    const x = generateSine(1, 8, 4, { amplitude: 2, phase: Math.PI });
    expect(x[0]).toBeCloseTo(-2, 10);
  });
});

describe("sumSines", () => {
  it("adds the components sample by sample", () => {
    const a = generateSine(1, 16, 8, { amplitude: 1 });
    const b = generateSine(3, 16, 8, { amplitude: 0.5 });
    const sum = sumSines(
      [
        { frequency: 1, amplitude: 1 },
        { frequency: 3, amplitude: 0.5 },
      ],
      16,
      8
    );
    for (let n = 0; n < 8; n++) {
      expect(sum[n]).toBeCloseTo(a[n] + b[n], 10);
    }
  });
});
