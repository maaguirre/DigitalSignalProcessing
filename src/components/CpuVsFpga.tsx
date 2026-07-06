import { useEffect, useRef, useState } from "react";
import { type Language, pick } from "../i18n.ts";

const COLORS = [
  "#38c6d4", "#e8833a", "#3ecf8e", "#e0554e", "#b98bd9",
  "#f2c94c", "#56a3f5", "#f178b6", "#7ed957", "#ff9f45",
];
const color = (i: number) => COLORS[i % COLORS.length];

export default function CpuVsFpga({ language }: { language: Language }) {
  const [n, setN] = useState(8);
  const [w, setW] = useState(4); // compute cost per sample (pipeline depth)
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const cpuTotal = n * w;
  const fpgaTotal = n + w - 1;

  function stop() {
    if (timer.current !== undefined) {
      window.clearInterval(timer.current);
      timer.current = undefined;
    }
    setRunning(false);
  }
  useEffect(() => {
    stop();
    setCycle(0);
  }, [n, w]);
  useEffect(() => () => stop(), []);

  function run() {
    stop();
    setCycle(0);
    setRunning(true);
    const maxCycle = Math.max(cpuTotal, fpgaTotal);
    let c = 0;
    timer.current = window.setInterval(() => {
      c += 1;
      setCycle(c);
      if (c >= maxCycle) stop();
    }, 520);
  }

  // CPU: one unit; finishes one sample every w cycles.
  const cpuOut = Math.min(n, Math.floor(cycle / w));
  const cpuWorking = cpuOut < n && cycle > 0 ? cpuOut : -1;
  const cpuProgress = cpuWorking >= 0 ? (cycle % w) + 1 : 0;

  // FPGA: pipeline of w stages; sample i is in stage (cycle-1-i), exits at i+w.
  const fpgaOut = Math.max(0, Math.min(n, cycle - w + 1));
  const stageSample = (s: number) => {
    const i = cycle - 1 - s;
    return i >= 0 && i < n ? i : -1;
  };

  const t = {
    n: { pt: "Amostras a processar (N)", en: "Samples to process (N)" },
    w: { pt: "Custo por amostra (W ciclos)", en: "Cost per sample (W cycles)" },
    run: { pt: "Rodar", en: "Run" },
    cpu: { pt: "CPU — 1 unidade, W ciclos por amostra", en: "CPU — 1 unit, W cycles per sample" },
    fpga: { pt: "FPGA — pipeline de W estágios, 1 resultado por ciclo", en: "FPGA — W-stage pipeline, 1 result per cycle" },
    unit: { pt: "unidade", en: "unit" },
    ready: { pt: "prontas", en: "done" },
    cyc: { pt: "ciclos", en: "cycles" },
    empty: { pt: "—", en: "—" },
    note: {
      pt: "A CPU só termina uma amostra a cada W ciclos. O FPGA gasta W ciclos para ENCHER o pipeline e, depois disso, entrega uma amostra pronta a cada ciclo — como uma esteira. Aumente W (mais contas por amostra, como um filtro maior) e veja: a CPU fica W vezes mais lenta, o FPGA quase não sente. Essa vazão constante é o que faz o FPGA brilhar em DSP.",
      en: "The CPU finishes one sample only every W cycles. The FPGA spends W cycles FILLING the pipeline and, after that, delivers a finished sample every cycle — like a conveyor belt. Raise W (more work per sample, like a bigger filter) and watch: the CPU gets W times slower, the FPGA barely notices. That steady throughput is what makes the FPGA shine at DSP.",
    },
  };

  const token = (i: number, size: "sm" | "lg" = "sm") => (
    <span
      className={`cvf-token cvf-token--${size}`}
      style={{ background: color(i), color: "#04171a" }}
    >
      {i}
    </span>
  );

  const cyclesBadge = (now: number, total: number, cls: string) => (
    <span className={`cvf-badge ${cls}`}>
      {Math.min(cycle, total)} {pick(t.cyc, language)} · {now}/{n} {pick(t.ready, language)}
    </span>
  );

  return (
    <div className="cvf">
      <div className="cvf-controls">
        <div className="control">
          <label>
            {pick(t.n, language)}: <span className="control-value">{n}</span>
          </label>
          <input type="range" min={4} max={10} value={n}
            onChange={(e) => setN(Number(e.target.value))} />
        </div>
        <div className="control">
          <label>
            {pick(t.w, language)}: <span className="control-value">{w}</span>
          </label>
          <input type="range" min={2} max={6} value={w}
            onChange={(e) => setW(Number(e.target.value))} />
        </div>
      </div>

      <button className="cvf-run" onClick={run} disabled={running} type="button">
        ▶ {pick(t.run, language)}
      </button>

      {/* CPU lane */}
      <div className="cvf-lane">
        <div className="cvf-lane-head">
          <span className="cvf-lane-title">{pick(t.cpu, language)}</span>
          {cyclesBadge(cpuOut, cpuTotal, "cvf-badge--cpu")}
        </div>
        <div className="cvf-pipe">
          <div className="cvf-unit">
            {cpuWorking >= 0 ? token(cpuWorking, "lg") : <span className="cvf-empty">{pick(t.empty, language)}</span>}
            <div className="cvf-progress">
              <div
                className="cvf-progress-fill cvf-progress-fill--cpu"
                style={{ width: `${(cpuProgress / w) * 100}%` }}
              />
            </div>
            <span className="cvf-unit-label">{pick(t.unit, language)}</span>
          </div>
          <span className="cvf-arrow">→</span>
          <div className="cvf-done">
            {Array.from({ length: cpuOut }).map((_, i) => token(i))}
          </div>
        </div>
      </div>

      {/* FPGA lane */}
      <div className="cvf-lane">
        <div className="cvf-lane-head">
          <span className="cvf-lane-title">{pick(t.fpga, language)}</span>
          {cyclesBadge(fpgaOut, fpgaTotal, "cvf-badge--fpga")}
        </div>
        <div className="cvf-pipe">
          <div className="cvf-stages">
            {Array.from({ length: w }).map((_, s) => {
              const i = stageSample(s);
              return (
                <div key={s} className="cvf-stage">
                  {i >= 0 ? token(i, "lg") : <span className="cvf-empty">{pick(t.empty, language)}</span>}
                </div>
              );
            })}
          </div>
          <span className="cvf-arrow">→</span>
          <div className="cvf-done">
            {Array.from({ length: fpgaOut }).map((_, i) => token(i))}
          </div>
        </div>
      </div>

      <div className="cvf-speedup">
        {pick(t.cpu, language).split(" —")[0]}: <strong>{cpuTotal}</strong> {pick(t.cyc, language)}
        {"  ·  "}
        {pick(t.fpga, language).split(" —")[0]}: <strong>{fpgaTotal}</strong> {pick(t.cyc, language)}
        {"  ·  "}
        <strong className="cvf-speedup-x">{(cpuTotal / fpgaTotal).toFixed(1)}×</strong>
      </div>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
