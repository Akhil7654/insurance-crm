'use client';

import { useEffect, useState } from 'react';
import {
  getHealthClients,
  deleteClient,
  getHealthRenewalSummary,
  renewHealthClient,
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import ConvertModal from '@/components/ConvertModal';
import { motion, AnimatePresence } from 'framer-motion';

function toYYYYMM(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function HealthClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const router = useRouter();

  const [month, setMonth] = useState<string>(() => toYYYYMM(new Date()));
  const [summary, setSummary] = useState<{ pending: number; missed: number } | null>(null);
  const [loadingRenew, setLoadingRenew] = useState<number | null>(null);

  const loadClients = async () => {
    const data = await getHealthClients();
    setClients(data);
  };

  const loadSummary = async () => {
    try {
      const s = await getHealthRenewalSummary(month);
      setSummary(s);
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line
  }, [month]);

  const handleDelete = async (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation();
    const ok = confirm('Delete this client? This removes all data.');
    if (!ok) return;

    try {
      await deleteClient(clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      await loadSummary();
    } catch {
      alert('Delete failed');
    }
  };

  const openRenewalList = (status: 'pending' | 'missed') => {
    router.push(`/health/renewals?month=${month}&status=${status}`);
  };

  // ✅ Set renewal date from card if missing
  const handleSetRenewal = async (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation();
    const next = prompt('Enter Renewal Date (YYYY-MM-DD)');
    if (!next) return;

    try {
      setLoadingRenew(clientId);
      await renewHealthClient(clientId, next);
      await loadClients();
      await loadSummary();
      alert('Renewal date saved ✅');
    } catch {
      alert('Failed to set renewal date');
    } finally {
      setLoadingRenew(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-300 p-6">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold text-black">Health Insurance Clients</h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/health/add')}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
          >
            + Add Client
          </motion.button>
        </motion.div>

        {/* ✅ RENEWAL CALENDAR */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-white font-bold text-lg">Renewal Calendar</p>
              <p className="text-gray-400 text-sm">Pick a month to view renewals</p>
            </div>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => openRenewalList('pending')}
              className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-left hover:bg-gray-800 transition"
            >
              <p className="text-yellow-300 font-bold">Pending Renewals</p>
              <p className="text-white text-2xl font-extrabold">{summary?.pending ?? 0}</p>
            </button>

            <button
              onClick={() => openRenewalList('missed')}
              className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-left hover:bg-gray-800 transition"
            >
              <p className="text-red-400 font-bold">Missed Renewals</p>
              <p className="text-white text-2xl font-extrabold">{summary?.missed ?? 0}</p>
            </button>
          </div>
        </div>

        {/* ✅ CLIENT CARDS */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {clients.map((client: any, i) => {
              const renewalDate = client.health_details?.renewal_date;
              const needsRenewalDate = !renewalDate;

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/health/client/${client.id}`)}
                  className="bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* LEFT INFO */}
                    <div className="min-w-0">
                      <p className="font-semibold text-base sm:text-lg text-white truncate">
                        {client.name}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-300 mt-1">
                        {client.mobile} · {client.place}
                      </p>

                      {renewalDate ? (
                        <p className="text-xs text-yellow-300 mt-2 font-semibold">
                          Renewal: {renewalDate}
                        </p>
                      ) : (
                        <p className="text-xs text-red-400 mt-2 font-semibold">
                          No renewal date set
                        </p>
                      )}

                      {client.is_converted && (
                        <span className="text-xs bg-lime-50 text-green-950 px-2 py-1 rounded-full mt-2 inline-block font-bold">
                          Converted 🏆
                        </span>
                      )}
                    </div>

                    {/* RIGHT BUTTONS (✅ vertical on mobile) */}
                    <div
                      className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto sm:items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Renew button only if missing renewal date */}
                      {needsRenewalDate && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          disabled={loadingRenew === client.id}
                          onClick={(e) => handleSetRenewal(e, client.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl text-sm w-full sm:w-auto"
                        >
                          {loadingRenew === client.id ? 'Saving...' : 'Set Renewal'}
                        </motion.button>
                      )}

                      {/* Convert */}
                      {!client.is_converted && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedClient(client.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm w-full sm:w-auto"
                        >
                          Convert
                        </motion.button>
                      )}

                      {/* Delete */}
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => handleDelete(e, client.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-sm w-full sm:w-auto"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {clients.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 py-10"
            >
              No health clients found.
            </motion.div>
          )}
        </div>

        {/* Convert Modal */}
        {selectedClient && (
          <ConvertModal
            clientId={selectedClient}
            onClose={() => setSelectedClient(null)}
            onSuccess={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
