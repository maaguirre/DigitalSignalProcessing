import { describe, it, expect } from "vitest";
import { fft, nextPowerOfTwo, type Complex } from "./fft.ts";

function real(xs: number[]): Complex[] {
  return xs.map((x) => ({ re: x, im: 0 }));
}

describe("nextPowerOfTwo", () => {
  it("rounds up to the next power of two", () => {
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(16)).toBe(16);
    expect(nextPowerOfTwo(100)).toBe(128);
  });
});

describe("fft", () => {
  it("rejects a length that is not a power of two", () => {
    expect(() => fft(real([1, 2, 3]))).toThrow(/power of two/);
  });

  it("the FFT of an impulse [1,0,0,0] is a flat spectrum (all = 1)", () => {
    const X = fft(real([1, 0, 0, 0]));
    for (const bin of X) {
      expect(bin.re).toBeCloseTo(1, 10);
      expect(bin.im).toBeCloseTo(0, 10);
    }
  });

  it("the FFT of a constant signal [1,1,1,1] puts everything in bin 0 (DC)", () => {
    const X = fft(real([1, 1, 1, 1]));
    expect(X[0].re).toBeCloseTo(4, 10);
    expect(X[0].im).toBeCloseTo(0, 10);
    for (let k = 1; k < 4; k++) {
      expect(X[k].re).toBeCloseTo(0, 10);
      expect(X[k].im).toBeCloseTo(0, 10);
    }
  });
});
