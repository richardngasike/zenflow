import { useState, useEffect, useRef, useCallback } from "react";
import { FiWind } from "react-icons/fi";
import { RiLungsLine } from "react-icons/ri";
import { TbWaveSine } from "react-icons/tb";
import styles from "./BreathingGame.module.css";

const PATTERNS = [
  { name: "4-7-8", inhale: 4, hold: 7, exhale: 8, label: "4-7-8 Calm" },
  { name: "box", inhale: 4, hold: 4, exhale: 4, holdOut: 4, label: "Box" },
  { name: "478s", inhale: 4, hold: 0, exhale: 4, label: "4-4 Quick" },
  { name: "deep", inhale: 6, hold: 2, exhale: 8, label: "Deep Rest" },
];

type Phase = "idle" | "inhale" | "hold" | "exhale" | "holdout";

export default function BreathingGame() {
  const [activePattern, setActivePattern] = useState(PATTERNS[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const countRef = useRef(0);

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getPhaseTotal = (p: Phase) => {
    if (p === "inhale") return activePattern.inhale;
    if (p === "hold") return activePattern.hold || 0;
    if (p === "exhale") return activePattern.exhale;
    if (p === "holdout") return (activePattern as any).holdOut || 0;
    return 0;
  };

  const nextPhase = useCallback((current: Phase, pat: typeof PATTERNS[0]): Phase => {
    if (current === "inhale") return pat.hold > 0 ? "hold" : "exhale";
    if (current === "hold") return "exhale";
    if (current === "exhale") return (pat as any).holdOut > 0 ? "holdout" : "inhale";
    if (current === "holdout") return "inhale";
    return "inhale";
  }, []);

  useEffect(() => {
    if (!running) return;
    clearAll();

    const pat = activePattern;
    phaseRef.current = "inhale";
    countRef.current = pat.inhale;
    setPhase("inhale");
    setCount(pat.inhale);
    setScale(1.45);

    intervalRef.current = setInterval(() => {
      setTotalSeconds(s => s + 1);
      countRef.current -= 1;

      if (countRef.current <= 0) {
        const next = nextPhase(phaseRef.current, pat);
        phaseRef.current = next;
        const total = next === "inhale" ? pat.inhale : next === "hold" ? (pat.hold || 0) : next === "exhale" ? pat.exhale : ((pat as any).holdOut || 0);
        countRef.current = total;
        setPhase(next);
        setCount(total);
        if (next === "inhale") setCycles(c => c + 1);
        if (next === "inhale") setScale(1.45);
        else if (next === "hold") setScale(1.45);
        else if (next === "exhale") setScale(1);
        else setScale(0.9);
      } else {
        setCount(countRef.current);
      }
    }, 1000);

    return clearAll;
  }, [running, activePattern, nextPhase]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      setPhase("idle");
      setScale(1);
      clearAll();
    } else {
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setPhase("idle");
    setCount(0);
    setCycles(0);
    setScale(1);
    setTotalSeconds(0);
    clearAll();
  };

  const getPhaseLabel = () => {
    if (phase === "idle") return "Tap to begin";
    if (phase === "inhale") return "Breathe in";
    if (phase === "hold") return "Hold";
    if (phase === "exhale") return "Breathe out";
    if (phase === "holdout") return "Hold";
    return "";
  };

  const getPhaseIcon = () => {
    if (phase === "exhale" || phase === "holdout") return <TbWaveSine className={styles.phaseIcon} />;
    if (phase === "hold") return <RiLungsLine className={styles.phaseIcon} />;
    return <FiWind className={styles.phaseIcon} />;
  };

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const circleStyle = {
    transform: `scale(${scale})`,
    transition: phase === "inhale"
      ? `transform ${activePattern.inhale}s cubic-bezier(0.4,0,0.2,1)`
      : phase === "exhale"
      ? `transform ${activePattern.exhale}s cubic-bezier(0.4,0,0.2,1)`
      : `transform 0.4s ease`,
    boxShadow: running
      ? `0 0 0 ${(scale - 0.9) * 40}px rgba(122,140,110,0.12), 0 0 0 ${(scale - 0.9) * 80}px rgba(122,140,110,0.05)`
      : undefined,
  };

  return (
    <div className={styles.container}>
      <div className={styles.patternRow}>
        {PATTERNS.map(p => (
          <button
            key={p.name}
            className={`${styles.patternBtn} ${activePattern.name === p.name ? styles.patternBtnActive : ""}`}
            onClick={() => { reset(); setActivePattern(p); }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.circleWrap}>
        <div className={styles.ring + " " + styles.ring1} />
        <div className={styles.ring + " " + styles.ring2} />
        <div className={styles.ring + " " + styles.ring3} />
        <div className={styles.circle} style={circleStyle} onClick={!running ? toggle : undefined}>
          {getPhaseIcon()}
          <span className={styles.phaseText}>{getPhaseLabel()}</span>
          {running && count > 0 && <span className={styles.timerSub}>{count}s</span>}
        </div>
      </div>

      <div className={styles.sessionInfo}>
        <div className={styles.stat}>
          <div className={styles.statNum}>{cycles}</div>
          <div className={styles.statLabel}>Cycles</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{mins}:{secs.toString().padStart(2, "0")}</div>
          <div className={styles.statLabel}>Duration</div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={toggle}>
          {running ? "Pause" : "Start"}
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={reset}>
          Reset
        </button>
      </div>

      <p className={styles.guide}>
        Follow the circle — expand as you inhale, hold steady, then release as you exhale.
        Let each breath slow your mind.
      </p>
    </div>
  );
}
