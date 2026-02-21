'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getHealthRenewals,
  renewHealthClient,
  deleteClientFull,
} from '@/lib/api';

export default function HealthRenewalsListPage() {
  const sp = useSearchParams();
  const month = sp.get('month') || '';
  const status = (sp.get('status') || 'pending') as 'pending' | 'missed';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!month) return;
    const data = await getHealthRenewals(month, status);
    setItems(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [month, status]);

  const onRenew = async (clientId: number) => {
    const next = prompt('Enter NEXT RENEWAL DATE (YYYY-MM-DD)');
    if (!next) return;

    try {
      setLoading(true);
      await renewHealthClient(clientId, next);
      await load();
      alert('Renewed ✅ moved to new date');
    } catch {
      alert('Renew failed');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteClient = async (clientId: number) => {
    const ok = confirm('This will DELETE the client and ALL data permanently. Continue?');
    if (!ok) return;

    try {
      setLoading(true);
      await deleteClientFull(clientId);
      await load();
      alert('Client deleted completely ✅');
    } catch {
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-300 p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Health Renewals — {status.toUpperCase()}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Month: {month}</p>
        </motion.div>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <p className="text-gray-400">No items found.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((it: any, i: number) => (
                <motion.div
                  key={it.client.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-gray-950 border border-gray-800 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    {/* LEFT INFO */}
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base sm:text-lg truncate">
                        {it.client.name}
                      </p>

                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        {it.client.mobile} · {it.client.place}
                      </p>

                      <p className="text-yellow-300 text-xs sm:text-sm mt-2 font-semibold">
                        Renewal Date: {it.renewal_date || '-'}
                      </p>

                      <div className="text-gray-300 text-xs mt-3">
                        Floater: {it.floater_type} | Ages: {it.ages}
                      </div>
                    </div>

                    {/* RIGHT BUTTONS (✅ vertical on mobile) */}
                    <div
                      className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto sm:justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        disabled={loading}
                        onClick={() => onRenew(it.client.id)}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold w-full sm:w-auto"
                      >
                        Renew
                      </motion.button>

                      {status === 'missed' && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          disabled={loading}
                          onClick={() => onDeleteClient(it.client.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold w-full sm:w-auto"
                        >
                          Delete Client
                        </motion.button>
                      )}
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
