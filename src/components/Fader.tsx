import { useCallback, useRef } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';

interface FaderProps {
  label: string;
  /** Cor CSS da dimensão (ex.: 'var(--c-picancia)'). */
  color: string;
  value: number;
  onChange: (value: number) => void;
}

const MAX = 10;
const STEP = 0.5;
const THUMB_HEIGHT = 28;

const clamp = (v: number) => Math.min(MAX, Math.max(0, v));

export function Fader({ label, color, value, onChange }: FaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromPointer = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = 1 - (clientY - rect.top) / rect.height;
      onChange(clamp(Math.round((ratio * MAX) / STEP) * STEP));
    },
    [onChange],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientY);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return; // só arrastando
    setFromPointer(e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') onChange(clamp(value + STEP));
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') onChange(clamp(value - STEP));
    else if (e.key === 'Home') onChange(0);
    else if (e.key === 'End') onChange(MAX);
    else return;
    e.preventDefault();
  };

  const ratio = value / MAX;
  const displayValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  return (
    <div className="fader" style={{ '--fc': color } as CSSProperties}>
      <span className="fader__value">{displayValue}</span>
      <div
        ref={trackRef}
        className="fader__track"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-valuenow={value}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <div className="fader__fill" style={{ height: `${ratio * 100}%` }} />
        <div
          className="fader__thumb"
          style={{ bottom: `calc((100% - ${THUMB_HEIGHT}px) * ${ratio})` }}
        />
      </div>
      <span className="fader__label">{label}</span>
    </div>
  );
}
