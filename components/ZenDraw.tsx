import { useRef, useState, useEffect, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import { TbEraser } from "react-icons/tb";
import styles from "./ZenDraw.module.css";

const COLORS = [
  { hex: "#4a5240", label: "Moss" },
  { hex: "#7a8c6e", label: "Sage" },
  { hex: "#6a8fa0", label: "Water" },
  { hex: "#b5604a", label: "Terracotta" },
  { hex: "#c49a3c", label: "Amber" },
  { hex: "#96a882", label: "Fern" },
  { hex: "#8aacbe", label: "Sky" },
  { hex: "#c4cdb8", label: "Mist" },
  { hex: "#3d3830", label: "Bark" },
];

const SIZES = [3, 7, 14, 22];

export default function ZenDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0].hex);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0] || e.changedTouches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f4f1eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current; if (!canvas) return;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = getCtx(); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current?.x ?? pos.x, lastPos.current?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = eraser ? "#f4f1eb" : color;
    ctx.lineWidth = eraser ? size * 2.5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = eraser ? 1 : 0.82;
    ctx.stroke();
    lastPos.current = pos;
  }, [color, size, eraser]);

  const endDraw = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = getCtx(); if (!ctx) return;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f4f1eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      <div className={styles.controls}>
        <div className={styles.colorRow}>
          {COLORS.map(c => (
            <div
              key={c.hex}
              className={`${styles.colorSwatch} ${color === c.hex && !eraser ? styles.swatchActive : ""}`}
              style={{ background: c.hex }}
              onClick={() => { setColor(c.hex); setEraser(false); }}
              title={c.label}
            />
          ))}
        </div>

        <div className={styles.sizeRow}>
          {SIZES.map(s => (
            <div
              key={s}
              className={`${styles.sizeBtn} ${size === s ? styles.sizeBtnActive : ""}`}
              style={{ width: Math.max(8, s * 0.9), height: Math.max(8, s * 0.9) }}
              onClick={() => setSize(s)}
            />
          ))}
        </div>

        <button className={`${styles.btn} ${styles.btnEraser} ${eraser ? styles.btnEraserActive : ""}`} onClick={() => setEraser(v => !v)}>
          <TbEraser className={styles.toolIcon} />
          Erase
        </button>

        <button className={`${styles.btn} ${styles.btnClear}`} onClick={clear}>
          <FiTrash2 className={styles.toolIcon} />
          Clear
        </button>
      </div>

      <p className={styles.hint}>
        Draw freely — mandalas, waves, dots, anything. There is no right or wrong here.
      </p>
    </div>
  );
}
