// Downsampler ↓D: keep every D-th sample, y[m] = x[mD] (Ingle & Proakis §9.2.1).
export function downsample(signal: number[], factor: number): number[] {
  if (!Number.isInteger(factor) || factor < 1) {
    throw new Error(
      `downsample: factor must be a positive integer, got ${factor}`
    );
  }
  const out: number[] = [];
  for (let i = 0; i < signal.length; i += factor) {
    out.push(signal[i]);
  }
  return out;
}

// Upsampler ↑I: insert I-1 zeros between samples — v[n] = x[n/I] when I divides
// n, else 0 (Ingle & Proakis §9.3.1). Output length is N·I.
export function upsample(signal: number[], factor: number): number[] {
  if (!Number.isInteger(factor) || factor < 1) {
    throw new Error(
      `upsample: factor must be a positive integer, got ${factor}`
    );
  }
  const out: number[] = [];
  for (const sample of signal) {
    out.push(sample);
    for (let z = 1; z < factor; z++) out.push(0);
  }
  return out;
}
