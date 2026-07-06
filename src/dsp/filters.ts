// FIR filter design (window method) and frequency response
export type Window = "rect" | "hann" | "hamming" | "blackman";

// Window sample w[n] for a length-M window.
export function windowValue(kind: Window, n: number, M: number): number {
  if (M <= 1) return 1;
  const x = (2 * Math.PI * n) / (M - 1);
  switch (kind) {
    case "hann":
      return 0.5 - 0.5 * Math.cos(x);
    case "hamming":
      return 0.54 - 0.46 * Math.cos(x);
    case "blackman":
      return 0.42 - 0.5 * Math.cos(x) + 0.08 * Math.cos(2 * x);
    default:
      return 1; // rectangular
  }
}

// Windowed-sinc lowpass FIR of length `length`, cutoff `cutoff` (rad/sample).
// The passband gain is normalized to `gain` (I for interpolation, 1 otherwise).
export function designLowpassFIR(
  cutoff: number,
  length: number,
  window: Window = "hamming",
  gain = 1
): number[] {
  const M = Math.max(1, Math.round(length));
  const c = (M - 1) / 2;
  const h: number[] = [];
  for (let n = 0; n < M; n++) {
    const k = n - c;
    const ideal = Math.abs(k) < 1e-9 ? cutoff / Math.PI : Math.sin(cutoff * k) / (Math.PI * k);
    h.push(ideal * windowValue(window, n, M));
  }
  const dc = h.reduce((a, b) => a + b, 0) || 1;
  return h.map((v) => (v / dc) * gain);
}

// Linear convolution y[n] = Σ_k h[k]·x[n−k]; output length N + M − 1.
export function firFilter(x: number[], h: number[]): number[] {
  const y = new Array<number>(x.length + h.length - 1).fill(0);
  for (let n = 0; n < x.length; n++) {
    for (let k = 0; k < h.length; k++) y[n + k] += x[n] * h[k];
  }
  return y;
}

export type FrequencyResponse = { omega: number[]; mag: number[] };

// Magnitude of H(e^{jω}) over ω ∈ [0, π], sampled at `points` frequencies.
export function frequencyResponse(h: number[], points = 256): FrequencyResponse {
  const omega: number[] = [];
  const mag: number[] = [];
  for (let i = 0; i < points; i++) {
    const w = (i / (points - 1)) * Math.PI;
    let re = 0;
    let im = 0;
    for (let n = 0; n < h.length; n++) {
      re += h[n] * Math.cos(w * n);
      im -= h[n] * Math.sin(w * n);
    }
    omega.push(w);
    mag.push(Math.hypot(re, im));
  }
  return { omega, mag };
}
