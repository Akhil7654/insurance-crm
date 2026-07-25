'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const cards = [
  {
    code: 'VH',
    label: 'Vehicle Insurance',
    description: 'Motor policies, quotes & renewals',
    href: '/vehicle',
    accent: '#5B8DEF',
    icon: (
      <>
        <path d="M4 16h16v-3.2a1 1 0 0 0-.6-.92L17 10l-1.6-3.6A2 2 0 0 0 13.6 5H10.4a2 2 0 0 0-1.8 1.4L7 10l-2.4 1.88a1 1 0 0 0-.6.92V16Z" />
        <path d="M4 12.5h16" />
        <circle cx="7.5" cy="16" r="1.75" />
        <circle cx="16.5" cy="16" r="1.75" />
      </>
    ),
  },
  {
    code: 'HL',
    label: 'Health Insurance',
    description: 'Individual & family floater plans',
    href: '/health',
    accent: '#5B8DEF',
    icon: (
      <>
        <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
        <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
      </>
    ),
  },
  {
    code: 'IN',
    label: 'Investment',
    description: 'SIPs, ULIPs & investment leads',
    href: '/investment',
    accent: '#5B8DEF',
    icon: (
      <>
        <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
        <path d="M4 18h16" />
      </>
    ),
  },
];

const reminder = {
  code: 'RM',
  label: 'Reminder Dashboard',
  description: 'Follow-ups, renewals & alerts due across every line of business',
  href: '/reminders',
  accent: '#E3A857',
  icon: (
    <>
      <path d="M6 8.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 12.5 6 8.5Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </>
  ),
};

function useClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function BentoCard({
  card,
  onOpen,
  index,
  wide = false,
}: {
  card: typeof cards[number];
  onOpen: () => void;
  index: number;
  wide?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.9 + index * 0.09 }}
      onClick={onOpen}
      className={`group relative text-left rounded-2xl p-[1px] overflow-hidden ${wide ? 'col-span-full' : ''}`}
    >
      {/* rotating gradient glow — visible only on hover */}
      <div
        className="absolute -inset-[40%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${card.accent} 12%, transparent 28%)`,
          animation: 'card-glow-spin 3.2s linear infinite',
        }}
      />

      <div
        className={`relative z-10 rounded-[15px] bg-[#0F1420] border border-white/[0.06] group-hover:border-white/[0.02] transition-colors ${
          wide ? 'flex items-center gap-5 px-6 py-6' : 'flex flex-col gap-5 px-6 py-7'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
            style={{ background: `${card.accent}1A`, color: card.accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]">
              {card.icon}
            </svg>
          </span>

          {!wide && (
            <span className="font-mono text-[10px] tracking-widest text-[#7C879E]">
              {card.code}
            </span>
          )}
        </div>

        <div className={wide ? 'flex-1 min-w-0' : ''}>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-[#F4F6FA]">{card.label}</span>
            {wide && (
              <span className="font-mono text-[10px] tracking-widest text-[#7C879E]">
                {card.code}
              </span>
            )}
            {wide && (
              <span className="relative flex h-1.5 w-1.5 ml-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E3A857] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E3A857]" />
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#7C879E] mt-1">{card.description}</p>
        </div>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-4 w-4 shrink-0 text-[#4A5468] transition-all duration-300 group-hover:translate-x-1"
          style={{ color: undefined }}
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const time = useClock();

  return (
    <div className="relative min-h-screen bg-[#05070C] text-[#F4F6FA] overflow-hidden">
      <style>{`
        @keyframes card-glow-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ambient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#5B8DEF]/[0.10] blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-[380px] w-[380px] rounded-full bg-[#E3A857]/[0.06] blur-[120px]"
        animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
        {/* header row: status + live clock */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-14"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34D399] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] text-[#7C879E] uppercase">
              Agent Workspace
            </span>
          </div>

          <span className="font-mono text-[11px] text-[#4A5468] tabular-nums">
            {time ?? '--:--:--'}
          </span>
        </motion.div>

        {/* landing wordmark reveal */}
        <div className="mb-4 overflow-hidden">
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h1 className="text-[13vw] sm:text-6xl font-semibold tracking-tight leading-none whitespace-nowrap">
              Insurance <span className="text-[#5B8DEF]">CRM</span>
            </h1>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
          className="h-px bg-white/10 mb-5"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-[#7C879E] text-[15px] mb-12 max-w-md"
        >
          One workspace for every policy, client and renewal you manage — motor, health and investment, in one place.
        </motion.p>

        {/* bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <BentoCard key={card.href} card={card} index={i} onOpen={() => router.push(card.href)} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <BentoCard card={reminder} index={cards.length} onOpen={() => router.push(reminder.href)} wide />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center text-[#4A5468] text-xs mt-16 font-mono"
        >
          © {new Date().getFullYear()} INSURANCE CRM
        </motion.p>
      </div>
    </div>
  );
}