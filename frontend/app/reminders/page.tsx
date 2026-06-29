'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const priorityTabs = [
  {
    value: 'HOT',
    label: 'HOT',
    icon: '🔥',
    activeClass: 'bg-red-600 text-white border-red-400 shadow-red-500/30',
  },
  {
    value: 'WARM',
    label: 'WARM',
    icon: '🌤',
    activeClass: 'bg-yellow-500 text-black border-yellow-300 shadow-yellow-500/30',
  },
  {
    value: 'COOL',
    label: 'COOL',
    icon: '❄',
    activeClass: 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30',
  },
];

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

export default function ReminderDashboard() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedPriority, setSelectedPriority] = useState('HOT');
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
        fetch(`${API}/notes/today/`).then((r) => r.json()),
        fetch(`${API}/notes/overdue/`).then((r) => r.json()),
        fetch(`${API}/notes/upcoming/`).then((r) => r.json()),
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

    try {
      await fetch(`${API}/notes/${id}/`, {
        method: 'DELETE',
      });

      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

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
    if (priority === 'HOT') return '🔥';
    if (priority === 'WARM') return '🌤';
    if (priority === 'COOL') return '❄';
    return '📌';
  };

  const filteredNotes = notes.filter(
    (n) => (n.priority || 'HOT') === selectedPriority
  );

  const overdueNotes = filteredNotes.filter((n) => n.status === 'overdue');
  const otherNotes = filteredNotes.filter((n) => n.status !== 'overdue');

  const counts = {
    HOT: notes.filter((n) => (n.priority || 'HOT') === 'HOT').length,
    WARM: notes.filter((n) => n.priority === 'WARM').length,
    COOL: notes.filter((n) => n.priority === 'COOL').length,
  };

  const renderCard = (n: any, i: number) => (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => routeToClient(n)}
      className="bg-gray-900 border rounded-2xl shadow-sm hover:shadow-xl cursor-pointer p-5 border-gray-800 transition"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-white text-lg">{n.text}</p>

          <p className="text-sm text-gray-300 mt-2">
            📅 Follow-up: {n.follow_up_date}
          </p>

          {n.client_name && (
            <p className="text-xs text-gray-400 mt-1">
              Client: {n.client_name}
            </p>
          )}
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
            Track HOT, WARM and COOL client follow-ups
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
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

                    <p
                      className={`text-sm mt-1 ${
                        isActive ? 'opacity-90' : 'text-gray-500'
                      }`}
                    >
                      {counts[tab.value as keyof typeof counts]} reminders
                    </p>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activePriority"
                      className="w-3 h-3 rounded-full bg-white/80"
                    />
                  )}
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
              key={selectedPriority}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -35 }}
              transition={{ duration: 0.25 }}
            >
              {overdueNotes.length > 0 && (
                <div className="mb-8 border-b border-gray-300 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      ⚠️ Overdue {selectedPriority} ({overdueNotes.length})
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
                      <motion.div className="space-y-4 overflow-hidden">
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 rounded-2xl shadow border p-8 text-center border-gray-800 mt-6"
                >
                  <p className="text-white text-lg font-bold">
                    🎉 No {selectedPriority} reminders pending
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    You're all caught up in this priority section.
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