import { describe, it, expect } from "vitest";
import { downsample, upsample } from "./resample.ts";

describe("downsample", () => {
  it("factor 1 returns a copy of the signal", () => {
    const x = [0, 1, 2, 3];
    const y = downsample(x, 1);
    expect(y).toEqual(x);
    expect(y).not.toBe(x);
  });

  it("keeps every D-th sample (y[m] = x[mD])", () => {
    expect(downsample([0, 1, 2, 3, 4, 5], 2)).toEqual([0, 2, 4]);
    expect(downsample([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([0, 3, 6]);
  });

  it("output length is ceil(N / factor)", () => {
    expect(downsample([0, 1, 2, 3, 4], 2)).toHaveLength(3);
    expect(downsample([0, 1, 2, 3, 4], 3)).toHaveLength(2);
  });

  it("rejects non-positive or non-integer factors", () => {
    expect(() => downsample([1, 2, 3], 0)).toThrow();
    expect(() => downsample([1, 2, 3], -2)).toThrow();
    expect(() => downsample([1, 2, 3], 1.5)).toThrow();
  });
});

describe("upsample", () => {
  it("factor 1 returns a copy of the signal", () => {
    const x = [1, 2, 3];
    const y = upsample(x, 1);
    expect(y).toEqual(x);
    expect(y).not.toBe(x);
  });

  it("inserts I-1 zeros between samples (length N·I)", () => {
    expect(upsample([1, 2, 3], 2)).toEqual([1, 0, 2, 0, 3, 0]);
    expect(upsample([1, 2], 3)).toEqual([1, 0, 0, 2, 0, 0]);
    expect(upsample([1, 2, 3], 2)).toHaveLength(6);
  });

  it("rejects non-positive or non-integer factors", () => {
    expect(() => upsample([1, 2, 3], 0)).toThrow();
    expect(() => upsample([1, 2, 3], 2.5)).toThrow();
  });
});
