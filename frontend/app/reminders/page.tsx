'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
} from 'framer-motion';

const API =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/* ------------------------------------------------------- */
/* PRIORITY TABS */
/* ------------------------------------------------------- */

const priorityTabs = [
  {
    value: 'HOT',
    label: 'HOT',
    icon: '🔥',
    activeClass:
      'bg-red-600 text-white border-red-400 shadow-red-500/30',
  },
  {
    value: 'WARM',
    label: 'WARM',
    icon: '🌤',
    activeClass:
      'bg-yellow-500 text-black border-yellow-300 shadow-yellow-500/30',
  },
  {
    value: 'COOL',
    label: 'COOL',
    icon: '❄',
    activeClass:
      'bg-blue-600 text-white border-blue-400 shadow-blue-500/30',
  },
] as const;

/* ------------------------------------------------------- */
/* INSURANCE FILTER */
/* ------------------------------------------------------- */

const insuranceTabs = [
  {
    value: 'all',
    title: 'All',
    icon: '🌐',
  },
  {
    value: 'vehicle',
    title: 'Vehicle',
    icon: '🚗',
  },
  {
    value: 'health',
    title: 'Health',
    icon: '❤️',
  },
] as const;

/* ------------------------------------------------------- */
/* LOADING */
/* ------------------------------------------------------- */

function RemindersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
        >
          <div className="h-5 w-64 bg-gray-800 rounded mb-3" />
          <div className="h-4 w-40 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- */
/* HELPERS (single source of truth — no duplicates) */
/* ------------------------------------------------------- */

const statusStyle = (status: string) => {
  switch (status) {
    case 'overdue':
      return 'border-red-500 bg-red-50 text-red-700';
    case 'today':
      return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    default:
      return 'border-blue-500 bg-blue-50 text-blue-700';
  }
};

const priorityBadgeStyle = (priority: string) => {
  switch (priority) {
    case 'HOT':
      return 'bg-red-600/20 text-red-300 border-red-500/40';
    case 'WARM':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    case 'COOL':
      return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
    default:
      return 'bg-gray-700 text-gray-300 border-gray-600';
  }
};

const priorityIcon = (priority: string) => {
  switch (priority) {
    case 'HOT':
      return '🔥';
    case 'WARM':
      return '🌤';
    case 'COOL':
      return '❄';
    default:
      return '📌';
  }
};

const insuranceIcon = (type: string) => {
  switch (type) {
    case 'vehicle':
      return '🚗';
    case 'health':
      return '❤️';
    default:
      return '🌐';
  }
};

/* ------------------------------------------------------- */
/* FETCH HELPER — throws on non-2xx instead of silently */
/* treating error bodies as data */
/* ------------------------------------------------------- */

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  // DELETE requests may return an empty body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default function ReminderDashboard() {
  const [notes, setNotes] = useState<any[]>([]);

  const [selectedPriority, setSelectedPriority] =
    useState<'HOT' | 'WARM' | 'COOL'>('HOT');

  const [selectedInsurance, setSelectedInsurance] =
    useState<'all' | 'vehicle' | 'health'>('all');

  const [hideOverdue, setHideOverdue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
        (a: any, b: any) =>
          new Date(a.follow_up_date).getTime() -
          new Date(b.follow_up_date).getTime()
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

    // Optimistic snapshot in case we need to roll back
    const prevNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await fetchJSON(`${API}/notes/${id}/`, { method: 'DELETE' });
    } catch {
      // Roll back on failure instead of leaving the UI out of sync
      setNotes(prevNotes);
      alert('Delete failed');
    }
  };

  /* ------------------------------------------------------- */
  /* FILTER NOTES */
  /* ------------------------------------------------------- */

  const insuranceFiltered = useMemo(() => {
    if (selectedInsurance === 'all') return notes;

    return notes.filter(
      (n) => n.client_insurance_type === selectedInsurance
    );
  }, [notes, selectedInsurance]);

  const filteredNotes = useMemo(() => {
    return insuranceFiltered.filter(
      (n) => (n.priority || 'HOT') === selectedPriority
    );
  }, [insuranceFiltered, selectedPriority]);

  const overdueNotes = useMemo(
    () => filteredNotes.filter((n) => n.status === 'overdue'),
    [filteredNotes]
  );

  const otherNotes = useMemo(
    () => filteredNotes.filter((n) => n.status !== 'overdue'),
    [filteredNotes]
  );

  /* ------------------------------------------------------- */
  /* PRIORITY COUNTS */
  /* ------------------------------------------------------- */

  const counts = useMemo(() => {
    return {
      HOT: insuranceFiltered.filter(
        (n) => (n.priority || 'HOT') === 'HOT'
      ).length,

      WARM: insuranceFiltered.filter(
        (n) => n.priority === 'WARM'
      ).length,

      COOL: insuranceFiltered.filter(
        (n) => n.priority === 'COOL'
      ).length,
    };
  }, [insuranceFiltered]);

  /* ------------------------------------------------------- */
  /* INSURANCE COUNTS */
  /* ------------------------------------------------------- */

  const insuranceCounts = useMemo(() => {
    return {
      all: notes.length,

      vehicle: notes.filter(
        (n) => n.client_insurance_type === 'vehicle'
      ).length,

      health: notes.filter(
        (n) => n.client_insurance_type === 'health'
      ).length,
    };
  }, [notes]);

  const renderCard = (n: any, i: number) => (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        delay: i * 0.05,
        duration: 0.35,
        type: 'spring',
      }}
      whileHover={{
        scale: 1.02,
        y: -3,
      }}
      onClick={() => routeToClient(n)}
      className="bg-gray-900 border rounded-2xl shadow-sm hover:shadow-2xl hover:border-blue-500 cursor-pointer p-5 border-gray-800 transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-white text-lg">{n.text}</p>

          <p className="text-sm text-gray-300 mt-2">
            📅 Follow-up: {n.follow_up_date}
          </p>

          {n.client_name && (
            <p className="text-xs text-gray-400 mt-1">
              👤 {n.client_name}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs bg-gray-800 text-gray-200 px-2 py-1 rounded-full border border-gray-700">
              {insuranceIcon(n.client_insurance_type)}{' '}
              {n.client_insurance_type === 'health' ? 'Health' : 'Vehicle'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${priorityBadgeStyle(
              n.priority || 'HOT'
            )}`}
          >
            {priorityIcon(n.priority || 'HOT')} {n.priority || 'HOT'}
          </span>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyle(
              n.status
            )}`}
          >
            {n.status}
          </span>

          <button
            onClick={(e) => handleDelete(e, n.id)}
            className="bg-red-500/10 hover:bg-red-500/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-red-500/20 hover:border-red-500/40"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Reminder Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            {selectedInsurance === 'all'
              ? 'Track all insurance reminders by lead priority'
              : selectedInsurance === 'vehicle'
              ? 'Viewing Vehicle Insurance reminders'
              : 'Viewing Health Insurance reminders'}
          </p>
        </motion.div>

        {/* ========================= */}
        {/* Insurance Filter */}
        {/* ========================= */}

        <LayoutGroup>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-2 shadow border border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                {insuranceTabs.map((tab) => {
                  const active = selectedInsurance === tab.value;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setSelectedInsurance(tab.value)}
                      className="relative rounded-xl py-3 overflow-hidden transition"
                    >
                      {active && (
                        <motion.div
                          layoutId="insurance-pill"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
                        />
                      )}

                      <div className="relative flex flex-col items-center">
                        <span className="text-2xl">{tab.icon}</span>

                        <span
                          className={`mt-1 font-semibold ${
                            active ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {tab.title}
                        </span>

                        <motion.span
                          key={insuranceCounts[tab.value]}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {insuranceCounts[tab.value]} Notes
                        </motion.span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </LayoutGroup>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {priorityTabs.map((tab) => {
            const isActive = selectedPriority === tab.value;

            return (
              <motion.button
                key={tab.value}
                type="button"
                onClick={() => setSelectedPriority(tab.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left shadow-lg transition ${
                  isActive
                    ? `${tab.activeClass} shadow-xl`
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl mb-2">{tab.icon}</p>
                    <p className="font-bold text-xl">{tab.label}</p>

                    <motion.p
                      key={counts[tab.value]}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`text-sm mt-1 ${
                        isActive ? 'opacity-90' : 'text-gray-500'
                      }`}
                    >
                      {counts[tab.value]} reminders
                    </motion.p>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activePriority"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-3 h-3 rounded-full bg-white/80"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {loading ? (
          <RemindersSkeleton />
        ) : error ? (
          <div className="bg-white rounded-2xl p-6 text-center border">
            <p className="text-red-600 font-semibold">{error}</p>

            <button
              onClick={load}
              className="mt-3 bg-black text-white px-4 py-2 rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedInsurance}-${selectedPriority}`}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -35 }}
              transition={{ duration: 0.25 }}
            >
              {overdueNotes.length > 0 && (
                <div className="mb-8 border-b border-gray-300 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                      <span className="text-2xl">⚠️</span>
                      Overdue
                      <span className="text-blue-600">{selectedPriority}</span>
                      <span className="px-2 py-1 rounded-full bg-gray-200 text-sm font-semibold">
                        {selectedInsurance === 'all'
                          ? '🌐 All'
                          : selectedInsurance === 'vehicle'
                          ? '🚗 Vehicle'
                          : '❤️ Health'}
                      </span>
                      <span className="text-gray-500">
                        ({overdueNotes.length})
                      </span>
                    </h2>

                    <button
                      onClick={() => setHideOverdue(!hideOverdue)}
                      className="text-sm px-3 font-semibold py-1.5 bg-gray-200 hover:bg-red-200 rounded-lg transition cursor-pointer text-black"
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
                        transition={{ duration: 0.35 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {overdueNotes.map((n: any, i) => renderCard(n, i))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="space-y-4">
                <AnimatePresence>
                  {otherNotes.map((n: any, i) => renderCard(n, i))}
                </AnimatePresence>
              </div>

              {filteredNotes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="bg-gray-900 rounded-3xl border border-gray-800 py-12 px-8 text-center mt-8"
                >
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                    }}
                    className="text-6xl mb-5"
                  >
                    {selectedInsurance === 'vehicle'
                      ? '🚗'
                      : selectedInsurance === 'health'
                      ? '❤️'
                      : '🌐'}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white">
                    No {selectedPriority} Reminders
                  </h3>

                  <p className="text-gray-400 mt-2">
                    {selectedInsurance === 'all'
                      ? 'Everything is completed across all insurance types.'
                      : `No ${selectedPriority} reminders for ${
                          selectedInsurance === 'vehicle'
                            ? 'Vehicle Insurance'
                            : 'Health Insurance'
                        }.`}
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