import { fft, nextPowerOfTwo, type Complex } from "./fft.ts";

export type Spectrum = {
  frequencies: number[];
  magnitudes: number[];
};

export function magnitudeSpectrum(
  signal: number[],
  sampleRate: number
): Spectrum {
  const N = nextPowerOfTwo(signal.length);

  const input: Complex[] = Array.from({ length: N }, (_, i) => ({
    re: signal[i] ?? 0,
    im: 0,
  }));

  const X = fft(input);

  const half = N / 2;
  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  for (let k = 0; k <= half; k++) {
    frequencies.push((k * sampleRate) / N);
    magnitudes.push(Math.hypot(X[k].re, X[k].im) / N);
  }

  return { frequencies, magnitudes };
}
