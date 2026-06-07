import Head from "next/head";
import { useState } from "react";
import { RiLeafLine, RiMoonLine, RiHeartLine, RiSunLine } from "react-icons/ri";
import { FiWind, FiCircle } from "react-icons/fi";
import { TbWaveSine, TbDroplet, TbPalette, TbRefresh } from "react-icons/tb";
import BreathingGame from "../components/BreathingGame";
import BubbleGame from "../components/BubbleGame";
import ZenDraw from "../components/ZenDraw";
import GratitudeJar from "../components/GratitudeJar";
import SoundScape from "../components/SoundScape";
import styles from "../styles/Home.module.css";

const TABS = [
  { id: "breath", label: "Breathe", icon: FiWind, desc: "Guided breathing to calm your nervous system", badge: "Calm" },
  { id: "bubbles", label: "Bubbles", icon: FiCircle, desc: "Pop bubbles mindfully — slow, satisfying, effortless", badge: "Focus" },
  { id: "draw", label: "Zen Draw", icon: TbPalette, desc: "Free-form drawing — no rules, just expression", badge: "Creative" },
  { id: "jar", label: "Gratitude", icon: RiHeartLine, desc: "Fill your jar with moments worth keeping", badge: "Reflect" },
  { id: "sound", label: "Soundscape", icon: TbWaveSine, desc: "Ambient tones to mask noise and ease your mind", badge: "Ambient" },
];

const MOODS = [
  { label: "Stressed", icon: RiSunLine, tab: "breath" },
  { label: "Tired", icon: RiMoonLine, tab: "sound" },
  { label: "Anxious", icon: TbDroplet, tab: "breath" },
  { label: "Restless", icon: FiCircle, tab: "bubbles" },
  { label: "Low mood", icon: RiHeartLine, tab: "jar" },
  { label: "Overwhelmed", icon: TbPalette, tab: "draw" },
];

const AFFIRMATIONS = [
  "This moment is enough. You are enough.",
  "You don't have to fix everything today.",
  "Rest is productive. Stillness is strength.",
  "You've handled hard things before. You will again.",
  "Breathe in. Let go. Begin again.",
  "Your pace is valid. Not everything needs urgency.",
  "Feeling is not failing. It's being human.",
  "Small steps still move you forward.",
  "You are not behind. You are right on time.",
  "What you're feeling will pass. It always does.",
];

export default function Home() {
  const [tab, setTab] = useState("breath");
  const [affIdx, setAffIdx] = useState(0);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const activeTab = TABS.find(t => t.id === tab)!;
  const TabIcon = activeTab.icon;

  const pickMood = (mood: typeof MOODS[0]) => {
    setActiveMood(mood.label);
    setTab(mood.tab);
  };

  return (
    <>
      <Head>
        <title>ZenFlow — Stress Relief Space</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <RiLeafLine className={styles.logoIcon} />
            <span className={styles.logoText}>ZenFlow</span>
          </div>
          <span className={styles.tagline}>Your quiet space</span>
        </header>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            A place to<br /><em>breathe, release,</em> and reset
          </h1>
          <p className={styles.heroSub}>
            Gentle games and tools designed to ease stress, quiet anxiety, and restore energy — one breath at a time.
          </p>
        </section>

        <div className={styles.moodBanner}>
          {MOODS.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${styles.moodTag} ${activeMood === m.label ? styles.moodTagActive : ""}`}
                onClick={() => pickMood(m)}>
                <Icon style={{ fontSize: "0.85rem" }} />
                {m.label}
              </div>
            );
          })}
        </div>

        <main className={styles.main}>
          <div className={styles.tabs}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                  onClick={() => setTab(t.id)}>
                  <Icon className={styles.tabIcon} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{activeTab.label}</div>
                <div className={styles.cardDesc}>{activeTab.desc}</div>
              </div>
              <div className={styles.cardBadge}>
                <TabIcon style={{ fontSize: "0.85rem" }} />
                {activeTab.badge}
              </div>
            </div>

            {tab === "breath" && <BreathingGame />}
            {tab === "bubbles" && <BubbleGame />}
            {tab === "draw" && <ZenDraw />}
            {tab === "jar" && <GratitudeJar />}
            {tab === "sound" && <SoundScape />}

            <div
              className={styles.affirmation}
              onClick={() => setAffIdx(i => (i + 1) % AFFIRMATIONS.length)}
            >
              <RiHeartLine className={styles.affirmIcon} />
              <div>
                <div className={styles.affirmText}>"{AFFIRMATIONS[affIdx]}"</div>
                <div className={styles.affirmHint}>Tap for another</div>
              </div>
              <TbRefresh style={{ fontSize: "0.9rem", color: "var(--mist)", flexShrink: 0 }} />
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.divider} />
          Made with care · ZenFlow · Your private space for calm
        </footer>
      </div>
    </>
  );
}
