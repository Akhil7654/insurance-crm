'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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
  const [hideOverdue, setHideOverdue] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
        ...overdue.map((n: any) => ({ ...n, priority: 'overdue' })),
        ...today.map((n: any) => ({ ...n, priority: 'today' })),
        ...upcoming.map((n: any) => ({ ...n, priority: 'upcoming' })),
      ];

      combined.sort(
        (a: any, b: any) =>
          new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
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
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    const ok = confirm('Delete this reminder?');
    if (!ok) return;

    try {
      await fetch(`${API}/notes/${id}/`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  const priorityStyle = (priority: string) => {
    switch (priority) {
      case 'overdue':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'today':
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-700';
    }
  };

  const overdueNotes = notes.filter((n) => n.priority === 'overdue');
  const otherNotes = notes.filter((n) => n.priority !== 'overdue');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">Reminder Dashboard</h1>
          <p className="text-gray-500 mt-1">Track upcoming and overdue client follow-ups</p>
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
          <>
            {/* OVERDUE */}
            {overdueNotes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 border-b border-gray-300 pb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    ⚠️ Overdue ({overdueNotes.length})
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
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {overdueNotes.map((n: any, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(`/vehicle/client/${n.client}`)}
                          className="bg-gray-900 border rounded-2xl shadow-sm hover:shadow-md cursor-pointer p-5 border-gray-800"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-semibold text-white text-lg">{n.text}</p>
                              <p className="text-sm text-white mt-2">
                                📅 Follow-up: {n.follow_up_date}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full border ${priorityStyle(
                                  n.priority
                                )}`}
                              >
                                {n.priority}
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
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TODAY + UPCOMING */}
            <div className="space-y-4">
              <AnimatePresence>
                {otherNotes.map((n: any, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/vehicle/client/${n.client}`)}
                    className="bg-gray-900 border rounded-2xl shadow-sm hover:shadow-md cursor-pointer p-5 border-gray-800"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-white text-lg">{n.text}</p>
                        <p className="text-sm text-white mt-2">
                          📅 Follow-up: {n.follow_up_date}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${priorityStyle(
                            n.priority
                          )}`}
                        >
                          {n.priority}
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
                ))}
              </AnimatePresence>
            </div>

            {/* EMPTY */}
            {notes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900 rounded-2xl shadow border p-8 text-center border-gray-800 mt-6"
              >
                <p className="text-white text-lg font-bold">🎉 No reminders pending</p>
                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}