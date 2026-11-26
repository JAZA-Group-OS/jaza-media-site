'use client';

import { motion } from 'framer-motion';

type Mood = 'thinking' | 'working' | 'reading' | 'writing' | 'happy';

function moodFor(step?: string): Mood {
  const s = (step ?? '').toLowerCase();
  if (!s) return 'thinking';
  if (/run|command|exec|build|install/.test(s)) return 'working';
  if (/read|search|look|find|fetch|check|list/.test(s)) return 'reading';
  if (/writ|edit|updat|creat|sav|repl/.test(s)) return 'writing';
  if (/done|finish|complete/.test(s)) return 'happy';
  return 'thinking';
}

const FACE: Record<Mood, { emoji: string; text: string }> = {
  thinking: { emoji: '🤔', text: 'Thinking it over' },
  working: { emoji: '⚙️', text: 'Hard at work' },
  reading: { emoji: '🔍', text: 'Looking things up' },
  writing: { emoji: '✍️', text: 'Writing it down' },
  happy: { emoji: '✨', text: 'Almost there' },
};

/** Animated robot whose face reacts to what the agent is doing. */
export default function ThinkingRobot({ step, size = 56 }: { step?: string; size?: number }) {
  const mood = moodFor(step);
  const eye = { thinking: 'M-4 0 a4 4 0 0 1 8 0', working: '', reading: '', writing: '', happy: 'M-4 1 a4 4 0 0 1 8 0' }[mood];

  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <motion.div
        animate={{ y: [0, -4, 0], rotate: mood === 'thinking' ? [0, -4, 0, 4, 0] : 0 }}
        transition={{ duration: mood === 'working' ? 0.8 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
          {/* antenna */}
          <line x1="32" y1="6" x2="32" y2="14" stroke="var(--adm-line-strong)" strokeWidth="2.5" strokeLinecap="round" />
          <motion.circle cx="32" cy="6" r="3.5" fill="var(--adm-accent)"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.25, 1] }}
            transition={{ duration: mood === 'working' ? 0.6 : 1.4, repeat: Infinity }} style={{ originX: '32px', originY: '6px' }} />
          {/* ears */}
          <rect x="5" y="28" width="6" height="12" rx="3" fill="var(--adm-accent)" />
          <rect x="53" y="28" width="6" height="12" rx="3" fill="var(--adm-accent)" />
          {/* head */}
          <rect x="10" y="14" width="44" height="40" rx="14" fill="var(--adm-raised)" stroke="var(--adm-accent)" strokeWidth="2.5" />
          {/* visor */}
          <rect x="16" y="22" width="32" height="20" rx="9" fill="#141414" />
          {/* eyes */}
          {(['L', 'R'] as const).map((side) => {
            const cx = side === 'L' ? 25 : 39;
            if (eye) {
              return (
                <g key={side} transform={`translate(${cx} 33)`}>
                  <path d={eye} fill="none" stroke="var(--adm-accent)" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              );
            }
            return (
              <motion.ellipse key={side} cx={cx} cy={32} rx={3.5} ry={mood === 'writing' ? 2 : 4} fill="var(--adm-accent)"
                animate={mood === 'reading' ? { cx: [cx - 2, cx + 2, cx - 2] } : { ry: [4, 4, 0.4, 4] }}
                transition={{ duration: mood === 'reading' ? 1.6 : 3, repeat: Infinity, times: mood === 'reading' ? undefined : [0, 0.9, 0.95, 1] }} />
            );
          })}
          {/* mouth */}
          {mood === 'working' ? (
            <motion.rect x="27" y="45" width="10" height="3" rx="1.5" fill="var(--adm-accent)"
              animate={{ width: [10, 4, 10], x: [27, 30, 27] }} transition={{ duration: 0.5, repeat: Infinity }} />
          ) : (
            <path d={mood === 'thinking' ? 'M27 47 h10' : 'M26 45 q6 5 12 0'} fill="none" stroke="var(--adm-accent)" strokeWidth="2.5" strokeLinecap="round" />
          )}
          {/* cheeks */}
          <circle cx="18" cy="46" r="2.5" fill="#ff7a90" opacity="0.55" />
          <circle cx="46" cy="46" r="2.5" fill="#ff7a90" opacity="0.55" />
        </svg>
        <motion.span
          key={mood}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1 -right-2 grid size-6 place-items-center rounded-full bg-adm-surface text-[13px] shadow ring-1 ring-adm-line"
        >
          {FACE[mood].emoji}
        </motion.span>
      </motion.div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-adm-text">{FACE[mood].text}</p>
        <p className="flex items-center gap-1 truncate text-[12px] text-adm-subtle">
          <span className="truncate">{step || 'Claude is working'}</span>
          {[0, 1, 2].map((d) => (
            <motion.span key={d} className="inline-block size-1 rounded-full bg-adm-accent"
              animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
          ))}
        </p>
      </div>
    </div>
  );
}
