import { useState, useEffect, useRef } from "react";
import { TbWaveSine, TbDroplet, TbFlame, TbWind, TbCloudRain, TbBell, TbBellOff } from "react-icons/tb";
import { RiLeafLine, RiMoonLine } from "react-icons/ri";
import styles from "./SoundScape.module.css";

type Sound = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  freq: number;
  type: OscillatorType | "brown" | "pink";
  description: string;
};

const SOUNDS: Sound[] = [
  { id: "rain", label: "Rain", icon: TbCloudRain, freq: 200, type: "brown", description: "Soft rainfall" },
  { id: "ocean", label: "Ocean", icon: TbWaveSine, freq: 100, type: "pink", description: "Gentle waves" },
  { id: "wind", label: "Wind", icon: TbWind, freq: 150, type: "brown", description: "Forest breeze" },
  { id: "fire", label: "Fire", icon: TbFlame, freq: 80, type: "brown", description: "Crackling fire" },
  { id: "water", label: "Stream", icon: TbDroplet, freq: 300, type: "pink", description: "Creek flow" },
  { id: "bells", label: "Bells", icon: TbBell, freq: 432, type: "sine", description: "Singing bowls" },
  { id: "forest", label: "Forest", icon: RiLeafLine, freq: 180, type: "brown", description: "Nature sounds" },
  { id: "night", label: "Night", icon: RiMoonLine, freq: 60, type: "pink", description: "Crickets & calm" },
];

type NoiseGen = { bufferSource: AudioBufferSourceNode; gainNode: GainNode; };

function createNoiseBuffer(ctx: AudioContext, type: string): AudioBuffer {
  const length = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  if (type === "brown") {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  } else {
    let b = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b[0] = 0.99886 * b[0] + white * 0.0555179;
      b[1] = 0.99332 * b[1] + white * 0.0750759;
      b[2] = 0.96900 * b[2] + white * 0.1538520;
      b[3] = 0.86650 * b[3] + white * 0.3104856;
      b[4] = 0.55000 * b[4] + white * 0.5329522;
      b[5] = -0.7616 * b[5] - white * 0.0168980;
      data[i] = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6]+white*0.5362) * 0.11;
      b[6] = white * 0.115926;
    }
  }
  return buf;
}

export default function SoundScape() {
  const [active, setActive] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ src: any; gain: GainNode } | null>(null);

  const stop = () => {
    if (nodesRef.current) {
      try {
        nodesRef.current.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.3);
        setTimeout(() => { try { nodesRef.current?.src.stop(); } catch {} nodesRef.current = null; }, 500);
      } catch {}
    }
  };

  const play = (sound: Sound) => {
    if (active === sound.id) { stop(); setActive(null); return; }
    stop();
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.setTargetAtTime(volume * 0.4, ctx.currentTime, 0.5);
    gainNode.connect(ctx.destination);

    if (sound.type === "sine" || sound.type === "sawtooth") {
      const osc = ctx.createOscillator();
      osc.type = sound.type;
      osc.frequency.setValueAtTime(sound.freq, ctx.currentTime);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gainNode);
      osc.start();
      nodesRef.current = { src: osc, gain: gainNode };
    } else {
      const buf = createNoiseBuffer(ctx, sound.type);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(sound.freq, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      src.connect(filter);
      filter.connect(gainNode);
      src.start();
      nodesRef.current = { src, gain: gainNode };
    }
    setActive(sound.id);
  };

  useEffect(() => {
    if (nodesRef.current && ctxRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(volume * 0.4, ctxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  useEffect(() => () => { stop(); try { ctxRef.current?.close(); } catch {} }, []);

  const activeSound = SOUNDS.find(s => s.id === active);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {SOUNDS.map(s => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <div
              key={s.id}
              className={`${styles.soundCard} ${isActive ? styles.soundCardActive : ""}`}
              onClick={() => play(s)}
            >
              <Icon className={styles.soundIcon} style={{ color: isActive ? "var(--cloud)" : "var(--sage)" }} />
              <span className={styles.soundLabel}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {activeSound && (
        <div className={styles.nowPlaying}>
          <div className={styles.wave}>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className={styles.waveBar} style={{ height: `${10 + Math.random() * 14}px`, animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
          Playing: {activeSound.description}
        </div>
      )}

      <div className={styles.volumeRow}>
        <TbBellOff />
        <input
          type="range"
          className={styles.slider}
          min={0} max={1} step={0.01}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
        />
        <TbBell />
      </div>

      <p className={styles.note}>
        Ambient sounds calm the nervous system. Pair with breathing or drawing for deeper relaxation.
        Click any sound to toggle.
      </p>
    </div>
  );
}
