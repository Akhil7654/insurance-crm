'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/* ------------------------------------------------------- */
/* CONFIG */
/* ------------------------------------------------------- */

const priorityTabs = [
  { value: 'HOT', label: 'Hot', color: '#EF6461' },
  { value: 'WARM', label: 'Warm', color: '#E3A857' },
  { value: 'COOL', label: 'Cool', color: '#5B8DEF' },
] as const;

const insuranceTabs = [
  {
    value: 'vehicle',
    title: 'Vehicle',
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
    value: 'health',
    title: 'Health',
    icon: (
      <>
        <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
        <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
      </>
    ),
  },
  {
    value: 'investment',
    title: 'Investment',
    icon: (
      <>
        <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
        <path d="M4 18h16" />
      </>
    ),
  },
] as const;

type InsuranceType = (typeof insuranceTabs)[number]['value'];
type PriorityType = (typeof priorityTabs)[number]['value'];

const isInsuranceType = (v: string | null): v is InsuranceType =>
  !!v && insuranceTabs.some((t) => t.value === v);

const isPriorityType = (v: string | null): v is PriorityType =>
  !!v && priorityTabs.some((t) => t.value === v);

/* ------------------------------------------------------- */
/* SMALL ICONS */
/* ------------------------------------------------------- */

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);

/* ------------------------------------------------------- */
/* HELPERS */
/* ------------------------------------------------------- */

const statusMeta = (status: string) => {
  switch (status) {
    case 'overdue':
      return { label: 'Overdue', color: '#EF6461' };
    case 'today':
      return { label: 'Due today', color: '#E3A857' };
    default:
      return { label: 'Upcoming', color: '#5B8DEF' };
  }
};

const priorityMeta = (priority: string) =>
  priorityTabs.find((p) => p.value === priority) || priorityTabs[0];

const insuranceMeta = (type: string) =>
  insuranceTabs.find((t) => t.value === type) || insuranceTabs[0];

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ------------------------------------------------------- */
/* SKELETON */
/* ------------------------------------------------------- */

function RemindersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#0F1420] border border-white/[0.06] rounded-2xl p-5 animate-pulse">
          <div className="h-4 w-64 bg-white/[0.06] rounded mb-3" />
          <div className="h-3 w-40 bg-white/[0.06] rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- */
/* MAIN */
/* ------------------------------------------------------- */

export default function ReminderDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ Initialize from URL so back-navigation restores the exact tab
  const [selectedInsurance, setSelectedInsuranceState] = useState<InsuranceType>(
    isInsuranceType(searchParams.get('type')) ? (searchParams.get('type') as InsuranceType) : 'vehicle'
  );
  const [selectedPriority, setSelectedPriorityState] = useState<PriorityType>(
    isPriorityType(searchParams.get('priority')) ? (searchParams.get('priority') as PriorityType) : 'HOT'
  );

  const [notes, setNotes] = useState<any[]>([]);
  const [hideOverdue, setHideOverdue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Keep the URL in sync whenever the tabs change, so it can be
  // restored on back/forward navigation without a page reload.
  const updateUrl = (nextType: InsuranceType, nextPriority: PriorityType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', nextType);
    params.set('priority', nextPriority);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSelectedInsurance = (type: InsuranceType) => {
    setSelectedInsuranceState(type);
    updateUrl(type, selectedPriority);
  };

  const setSelectedPriority = (priority: PriorityType) => {
    setSelectedPriorityState(priority);
    updateUrl(selectedInsurance, priority);
  };

  // If the user lands here with no query params at all (fresh visit),
  // write the defaults into the URL so the very first back-nav still works.
  useEffect(() => {
    if (!searchParams.get('type') || !searchParams.get('priority')) {
      updateUrl(selectedInsurance, selectedPriority);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeToClient = (n: any) => {
    const type = n.client_insurance_type || 'vehicle';
    router.push(`/${type}/client/${n.client}`);
  };

  const load = async () => {
    try {
      setError(null);
      setLoading(true);

      const [today, overdue, upcoming] = await Promise.all([
        fetchJSON(`${API}/notes/today/`),
        fetchJSON(`${API}/notes/overdue/`),
        fetchJSON(`${API}/notes/upcoming/`),
      ]);

      const combined = [
        ...overdue.map((n: any) => ({ ...n, status: 'overdue' })),
        ...today.map((n: any) => ({ ...n, status: 'today' })),
        ...upcoming.map((n: any) => ({ ...n, status: 'upcoming' })),
      ];

      combined.sort(
        (a: any, b: any) => new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
      );

      setNotes(combined);
    } catch {
      setError('Failed to load reminders');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const ok = confirm('Delete this reminder?');
    if (!ok) return;

    const prevNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await fetchJSON(`${API}/notes/${id}/`, { method: 'DELETE' });
    } catch {
      setNotes(prevNotes);
      alert('Delete failed');
    }
  };

  const insuranceFiltered = useMemo(
    () => notes.filter((n) => n.client_insurance_type === selectedInsurance),
    [notes, selectedInsurance]
  );

  const filteredNotes = useMemo(
    () => insuranceFiltered.filter((n) => (n.priority || 'HOT') === selectedPriority),
    [insuranceFiltered, selectedPriority]
  );

  const overdueNotes = useMemo(() => filteredNotes.filter((n) => n.status === 'overdue'), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => n.status !== 'overdue'), [filteredNotes]);

  const counts = useMemo(
    () => ({
      HOT: insuranceFiltered.filter((n) => (n.priority || 'HOT') === 'HOT').length,
      WARM: insuranceFiltered.filter((n) => n.priority === 'WARM').length,
      COOL: insuranceFiltered.filter((n) => n.priority === 'COOL').length,
    }),
    [insuranceFiltered]
  );

  const insuranceCounts = useMemo(
    () => ({
      vehicle: notes.filter((n) => n.client_insurance_type === 'vehicle').length,
      health: notes.filter((n) => n.client_insurance_type === 'health').length,
      investment: notes.filter((n) => n.client_insurance_type === 'investment').length,
    }),
    [notes]
  );

  const renderCard = (n: any, i: number) => {
    const status = statusMeta(n.status);
    const priority = priorityMeta(n.priority || 'HOT');
    const insurance = insuranceMeta(n.client_insurance_type);

    return (
      <motion.div
        key={n.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: i * 0.04, duration: 0.3 }}
        onClick={() => routeToClient(n)}
        className="group relative rounded-2xl p-[1px] overflow-hidden cursor-pointer"
      >
        <div
          className="absolute -inset-[40%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${priority.color} 12%, transparent 28%)`,
            animation: 'card-glow-spin 3.2s linear infinite',
          }}
        />

        <div className="relative z-10 rounded-[15px] bg-[#0F1420] border border-white/[0.06] group-hover:border-white/[0.02] transition-colors p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: `${insurance ? '#5B8DEF' : '#5B8DEF'}1A`, color: '#5B8DEF' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    {insurance.icon}
                  </svg>
                </span>
                <span className="font-mono text-[10px] tracking-widest text-[#7C879E] uppercase">
                  {insurance.title}
                </span>
              </div>

              <p className="font-medium text-[15px] text-[#F4F6FA] leading-snug">{n.text}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-[#7C879E]">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon /> {n.follow_up_date}
                </span>
                {n.client_name && (
                  <span className="flex items-center gap-1.5">
                    <UserIcon /> {n.client_name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={{
                  color: priority.color,
                  borderColor: `${priority.color}40`,
                  background: `${priority.color}14`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: priority.color }} />
                {priority.label}
              </span>

              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={{
                  color: status.color,
                  borderColor: `${status.color}40`,
                  background: `${status.color}14`,
                }}
              >
                {status.label}
              </span>

              <button
                onClick={(e) => handleDelete(e, n.id)}
                className="flex items-center gap-1.5 text-[#7C879E] hover:text-[#EF6461] px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
              >
                <TrashIcon /> Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#05070C] text-[#F4F6FA] overflow-hidden">
      <style>{`
        @keyframes card-glow-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#5B8DEF]/[0.08] blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 py-14 sm:py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#E3A857] uppercase mb-3">
            Reminder Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Follow-ups &amp; renewals</h1>
          <p className="text-[#7C879E] mt-2 text-[15px]">
            Viewing {insuranceTabs.find((t) => t.value === selectedInsurance)?.title} reminders
          </p>
        </motion.div>

        {/* Insurance segmented control */}
        <LayoutGroup>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-2xl bg-[#0F1420] border border-white/[0.06] p-1.5"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {insuranceTabs.map((tab) => {
                const active = selectedInsurance === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedInsurance(tab.value)}
                    className="relative rounded-xl py-3.5 overflow-hidden transition"
                  >
                    {active && (
                      <motion.div
                        layoutId="insurance-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-[#5B8DEF]/[0.14] border border-[#5B8DEF]/40 rounded-xl"
                      />
                    )}

                    <div className="relative flex flex-col items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 transition-colors ${active ? 'text-[#5B8DEF]' : 'text-[#565F76]'}`}
                      >
                        {tab.icon}
                      </svg>

                      <span className={`text-[13px] font-medium transition-colors ${active ? 'text-[#F4F6FA]' : 'text-[#7C879E]'}`}>
                        {tab.title}
                      </span>

                      <span className={`font-mono text-[10px] ${active ? 'text-[#5B8DEF]' : 'text-[#565F76]'}`}>
                        {insuranceCounts[tab.value]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </LayoutGroup>

        {/* Priority stat tiles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {priorityTabs.map((tab) => {
            const active = selectedPriority === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedPriority(tab.value)}
                className="relative rounded-2xl p-[1px] overflow-hidden text-left"
              >
                {active && (
                  <div
                    className="absolute -inset-[40%] opacity-90"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0%, ${tab.color} 14%, transparent 30%)`,
                      animation: 'card-glow-spin 3.2s linear infinite',
                    }}
                  />
                )}

                <div
                  className={`relative z-10 rounded-[15px] px-4 py-4 border transition-colors ${
                    active ? 'bg-[#0F1420] border-white/[0.02]' : 'bg-[#0F1420] border-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: tab.color }} />
                    <span className="text-[13px] font-medium text-[#F4F6FA]">{tab.label}</span>
                  </div>
                  <motion.p
                    key={counts[tab.value]}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-2xl font-semibold text-[#F4F6FA]"
                  >
                    {counts[tab.value]}
                  </motion.p>
                  <p className="text-[11px] text-[#7C879E] mt-0.5">reminders</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* List */}
        {loading ? (
          <RemindersSkeleton />
        ) : error ? (
          <div className="bg-[#0F1420] border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#EF6461] font-medium text-sm">{error}</p>
            <button
              onClick={load}
              className="mt-4 bg-[#5B8DEF] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#4a7ce0] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedInsurance}-${selectedPriority}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {overdueNotes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-sm font-medium text-[#EF6461]">
                      <AlertIcon />
                      Overdue
                      <span className="font-mono text-[#7C879E]">({overdueNotes.length})</span>
                    </h2>

                    <button
                      onClick={() => setHideOverdue(!hideOverdue)}
                      className="text-[12px] px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors text-[#7C879E]"
                    >
                      {hideOverdue ? 'Show' : 'Hide'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {!hideOverdue && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {overdueNotes.map((n: any, i) => renderCard(n, i))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="space-y-3">
                <AnimatePresence>{otherNotes.map((n: any, i) => renderCard(n, i))}</AnimatePresence>
              </div>

              {filteredNotes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0F1420] border border-white/[0.06] rounded-2xl py-14 px-8 text-center mt-4"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B8DEF]/10 text-[#5B8DEF]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      {insuranceMeta(selectedInsurance).icon}
                    </svg>
                  </motion.div>

                  <h3 className="text-lg font-medium text-[#F4F6FA]">
                    No {priorityMeta(selectedPriority).label.toLowerCase()} reminders
                  </h3>
                  <p className="text-[#7C879E] text-sm mt-1.5">
                    Nothing due for {insuranceTabs.find((t) => t.value === selectedInsurance)?.title} right now.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}