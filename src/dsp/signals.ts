export type SineComponent = {
  frequency: number;
  amplitude?: number;
  phase?: number;
};

export function generateSine(
  frequency: number,
  sampleRate: number,
  numSamples: number,
  options: { amplitude?: number; phase?: number } = {}
): number[] {
  const { amplitude = 1, phase = 0 } = options;
  const signal: number[] = [];
  for (let n = 0; n < numSamples; n++) {
    const time = n / sampleRate;
    signal.push(amplitude * Math.cos(2 * Math.PI * frequency * time + phase));
  }
  return signal;
}

export function sumSines(
  components: SineComponent[],
  sampleRate: number,
  numSamples: number
): number[] {
  const signal = new Array<number>(numSamples).fill(0);
  for (const c of components) {
    const part = generateSine(c.frequency, sampleRate, numSamples, {
      amplitude: c.amplitude,
      phase: c.phase,
    });
    for (let n = 0; n < numSamples; n++) {
      signal[n] += part[n];
    }
  }
  return signal;
}
