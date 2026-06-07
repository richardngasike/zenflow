import { useState, useEffect, useRef, useCallback } from "react";
import { FiCircle } from "react-icons/fi";
import { RiLeafLine, RiFlowerLine, RiMoonLine, RiStarLine, RiSunLine } from "react-icons/ri";
import { TbDroplet, TbSnowflake } from "react-icons/tb";
import styles from "./BubbleGame.module.css";

const ICONS = [RiLeafLine, RiFlowerLine, RiMoonLine, RiStarLine, RiSunLine, TbDroplet, TbSnowflake, FiCircle];
const COLORS = [
  { bg: "rgba(150,168,130,0.18)", border: "#96a882" },
  { bg: "rgba(106,143,160,0.18)", border: "#6a8fa0" },
  { bg: "rgba(181,96,74,0.14)", border: "#c97a5e" },
  { bg: "rgba(196,154,60,0.16)", border: "#c49a3c" },
  { bg: "rgba(74,82,64,0.12)", border: "#7a8c6e" },
  { bg: "rgba(138,172,190,0.18)", border: "#8aacbe" },
];

type Diff = "gentle" | "steady" | "flow";
const DIFF_CONFIG = {
  gentle: { interval: 2200, speed: 14, size: [60, 90] },
  steady: { interval: 1500, speed: 10, size: [50, 80] },
  flow:   { interval: 900,  speed: 7,  size: [40, 70] },
};

interface Bubble { id: number; x: number; y: number; size: number; color: typeof COLORS[0]; icon: typeof ICONS[0]; duration: number; popped: boolean; }
interface ScorePopup { id: number; x: number; y: number; }

let uid = 0;

export default function BubbleGame() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [pops, setPops] = useState<ScorePopup[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [running, setRunning] = useState(false);
  const [diff, setDiff] = useState<Diff>("gentle");
  const arenaRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawn = useCallback(() => {
    const cfg = DIFF_CONFIG[diff];
    const size = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
    const arenaW = arenaRef.current?.offsetWidth || 400;
    const x = size / 2 + Math.random() * (arenaW - size);
    const duration = cfg.speed + Math.random() * 4;
    const bubble: Bubble = {
      id: uid++,
      x,
      y: 400,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      duration,
      popped: false,
    };
    setBubbles(prev => [...prev.slice(-25), bubble]);
  }, [diff]);

  useEffect(() => {
    if (!running) return;
    const cfg = DIFF_CONFIG[diff];
    spawnRef.current = setInterval(spawn, cfg.interval);
    cleanRef.current = setInterval(() => {
      setBubbles(prev => prev.filter(b => !b.popped || Date.now() - (b as any).poppedAt < 400));
    }, 500);
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (cleanRef.current) clearInterval(cleanRef.current);
    };
  }, [running, diff, spawn]);

  const pop = (id: number, x: number, y: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true, poppedAt: Date.now() } as any : b));
    setScore(s => s + 1);
    setStreak(s => s + 1);
    setPops(prev => [...prev, { id: uid++, x, y }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== uid - 1)), 900);
  };

  const start = () => { setScore(0); setStreak(0); setBubbles([]); setRunning(true); };
  const stop = () => { setRunning(false); setBubbles([]); if (spawnRef.current) clearInterval(spawnRef.current); };

  const Icon = FiCircle;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stat}>
          <div className={styles.statNum}>{score}</div>
          <div className={styles.statLabel}>Popped</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{streak}</div>
          <div className={styles.statLabel}>Streak</div>
        </div>
        <div className={styles.diffRow}>
          {(["gentle", "steady", "flow"] as Diff[]).map(d => (
            <button key={d} className={`${styles.diffBtn} ${diff === d ? styles.diffBtnActive : ""}`}
              onClick={() => { stop(); setDiff(d); }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.arena} ref={arenaRef}>
        {!running && (
          <div className={styles.idle}>
            <FiCircle className={styles.idleIcon} />
            <span className={styles.idleText}>Tap bubbles as they float up</span>
          </div>
        )}
        {bubbles.map(b => {
          const BIcon = b.icon;
          return (
            <div
              key={b.id}
              className={`${styles.bubble} ${b.popped ? styles.pop : ""}`}
              style={{
                left: b.x - b.size / 2,
                bottom: 0,
                width: b.size,
                height: b.size,
                background: b.color.bg,
                border: `1.5px solid ${b.color.border}`,
                animationDuration: `${b.duration}s`,
                animationPlayState: b.popped ? "paused" : "running",
              }}
              onClick={(e) => {
                if (!b.popped) {
                  const rect = (e.target as HTMLElement).closest("." + styles.arena)?.getBoundingClientRect();
                  pop(b.id, b.x, b.y);
                }
              }}
            >
              <div className={styles.bubbleInner}>
                <BIcon className={styles.bubbleIcon} style={{ color: b.color.border, fontSize: b.size * 0.38 }} />
              </div>
            </div>
          );
        })}
        {pops.map(p => (
          <div key={p.id} className={styles.scorePopup} style={{ left: p.x, top: "40%" }}>+1</div>
        ))}
      </div>

      <div className={styles.controls}>
        {!running
          ? <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={start}>Start</button>
          : <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={stop}>Stop</button>
        }
      </div>

      <p className={styles.moodNote}>
        Pop each bubble with a gentle tap. No rushing — let your hands follow your rhythm.
      </p>
    </div>
  );
}
