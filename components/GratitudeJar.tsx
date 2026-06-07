import { useState, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { RiQuillPenLine } from "react-icons/ri";
import styles from "./GratitudeJar.module.css";

const PROMPTS = [
  "Something that made you smile today...",
  "A person you're grateful to have in your life...",
  "A small joy you noticed recently...",
  "Something your body did well for you today...",
  "A moment of beauty you witnessed...",
  "Something you're looking forward to...",
  "A skill or strength you have...",
  "An experience that taught you something...",
];

interface Note { id: number; text: string; date: string; }

const KEY = "zenflow_gratitude";

const load = (): Note[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

const save = (notes: Note[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch {}
};

export default function GratitudeJar() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => { setNotes(load()); }, []);

  const add = () => {
    if (!text.trim()) return;
    const note: Note = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    };
    const next = [note, ...notes];
    setNotes(next);
    save(next);
    setText("");
  };

  const remove = (id: number) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    save(next);
  };

  const nextPrompt = () => setPromptIdx(i => (i + 1) % PROMPTS.length);

  const fill = Math.min(notes.length / 20, 1);
  const fillHeight = 70 + fill * 90;

  return (
    <div className={styles.container}>
      <div className={styles.jar}>
        <svg viewBox="0 0 160 200" className={styles.jarSvg} fill="none">
          {/* Jar body */}
          <path d="M30 70 Q28 200 80 200 Q132 200 130 70Z" fill="rgba(212,169,106,0.12)" stroke="#c49a3c" strokeWidth="1.5"/>
          {/* Fill level */}
          <clipPath id="jar-clip">
            <path d="M30 70 Q28 200 80 200 Q132 200 130 70Z"/>
          </clipPath>
          <rect x="28" y={200 - fillHeight} width="104" height={fillHeight} fill="rgba(196,154,60,0.22)" clipPath="url(#jar-clip)" style={{ transition: "all 0.5s ease" }}/>
          {/* Lid */}
          <rect x="22" y="55" width="116" height="18" rx="5" fill="#c49a3c" opacity="0.7"/>
          <rect x="45" y="48" width="70" height="12" rx="4" fill="#c49a3c" opacity="0.5"/>
          {/* Shine */}
          <line x1="50" y1="80" x2="50" y2="185" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round"/>
        </svg>
        <div className={styles.noteCount}>{notes.length}</div>
      </div>

      <div className={styles.inputWrap}>
        <p className={styles.prompt} onClick={nextPrompt}>
          <RiQuillPenLine style={{ marginRight: 4, verticalAlign: "middle" }} />
          {PROMPTS[promptIdx]}
          <span style={{ marginLeft: 6, fontSize: "0.68rem", opacity: 0.5 }}>tap to change</span>
        </p>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write something you're grateful for..."
          rows={3}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) add(); }}
        />
        <button className={styles.addBtn} onClick={add} disabled={!text.trim()}>
          <FiPlus /> Add to jar
        </button>
      </div>

      <div className={styles.notesList}>
        {notes.length === 0 && (
          <p className={styles.emptyNote}>Your jar is empty. Add your first gratitude above.</p>
        )}
        {notes.map(n => (
          <div key={n.id} className={styles.note}>
            <span className={styles.noteText}>{n.text}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span className={styles.noteDate}>{n.date}</span>
              <button className={styles.removeBtn} onClick={() => remove(n.id)} title="Remove"><FiX /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
