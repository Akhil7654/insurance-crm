'use client';

import { useState } from 'react';
import { updateClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function ClientSummary({ client }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(client);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateClient(client.id, {
        name: form.name,
        mobile: form.mobile,
        place: form.place,
      });
      setForm((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Helpers
  const agesArr =
    typeof form.health_details?.ages === 'string'
      ? form.health_details.ages
          .split(',')
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [];

  const renewalDate = form.health_details?.renewal_date;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="relative overflow-hidden bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-800 text-white"
    >
      {/* subtle gradient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-emerald-500 blur-3xl" />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-5">Edit Client Details</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Client Name"
                  className="w-full bg-gray-950/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                />

                <input
                  type="text"
                  value={form.mobile || ''}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="Mobile Number"
                  className="w-full bg-gray-950/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                />

                <input
                  type="text"
                  value={form.place || ''}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="Location"
                  className="w-full bg-gray-950/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-2xl border border-gray-600 hover:bg-gray-800 transition font-semibold"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-2xl bg-white text-black hover:bg-gray-200 transition shadow font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
              >
                <motion.div variants={fadeUp} className="space-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {form.name}
                  </h2>

                  <p className="text-gray-200">📞 {form.mobile}</p>
                  <p className="text-gray-200">📍 {form.place}</p>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      className="text-xs bg-gray-800/80 border border-gray-700 px-3 py-1 rounded-full font-bold"
                    >
                      {String(form.insurance_type || '').toUpperCase()}
                    </motion.span>

                    {form.insurance_type === 'health' && (
                      <motion.span
                        whileHover={{ scale: 1.06 }}
                        className="text-xs bg-emerald-900/40 border border-emerald-800 px-3 py-1 rounded-full font-bold text-emerald-200"
                      >
                        {form.health_details?.floater_type === 'family'
                          ? 'FAMILY FLOATER'
                          : 'INDIVIDUAL'}
                      </motion.span>
                    )}

                    
                  </div>
                </motion.div>

                <motion.a
                  variants={fadeUp}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href={`tel:${form.mobile}`}
                  className="inline-flex items-center justify-center bg-green-300 hover:bg-green-200 text-black px-5 py-2 rounded-2xl text-sm font-semibold shadow transition"
                >
                  📞 Call Client
                </motion.a>
              </motion.div>

              {/* Vehicle details */}
              {form.insurance_type === 'vehicle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="mt-5 pt-4 border-t border-gray-800 text-sm bg-gray-950/70 rounded-2xl p-4"
                >
                  <p className="font-bold mb-3 text-white underline">
                    Vehicle Information
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3"
                    >
                      <p className="text-gray-400 text-xs">Vehicle Type</p>
                      <p className="text-white font-bold">
                        {form.vehicle_details?.vehicle_type || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3"
                    >
                      <p className="text-gray-400 text-xs">Insurance Cover</p>
                      <p className="text-white font-bold">
                        {form.vehicle_details?.insurance_cover || '-'}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Health details */}
              {form.insurance_type === 'health' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="mt-5 pt-4 border-t border-gray-800 text-sm bg-gray-950/70 rounded-2xl p-4"
                >
                  <p className="font-bold mb-3 text-white underline">
                    Health Information
                  </p>

                  {/* ✅ ONLY Renewal card here (floater removed) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3"
                    >
                      <p className="text-gray-400 text-xs">Renewal Date</p>
                      <p className="text-white font-bold">
                        {renewalDate ? renewalDate : 'Not set'}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3"
                    >
                      <p className="text-gray-400 text-xs">Total Members</p>
                      <p className="text-white font-bold">
                        {agesArr.length || 0}
                      </p>
                    </motion.div>
                  </div>

                  {/* Ages chips */}
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-2">Ages</p>

                    {agesArr.length === 0 ? (
                      <p className="text-gray-300">No ages added</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {agesArr.map((age: string, idx: number) => (
                          <motion.span
                            key={`${age}-${idx}`}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.96 }}
                            className="text-sm font-bold bg-blue-900/40 border border-blue-800 text-blue-200 px-3 py-1 rounded-full shadow-sm"
                          >
                            {age} yrs
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PED box */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="mt-4 bg-gray-900/70 border border-gray-800 rounded-2xl p-3"
                  >
                    <p className="text-gray-400 text-xs mb-1">
                      PED (Pre-existing Disease)
                    </p>
                    <p className="text-white font-medium whitespace-pre-wrap">
                      {form.health_details?.ped?.trim()
                        ? form.health_details.ped
                        : 'No PED'}
                    </p>
                  </motion.div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(true)}
                className="mt-5 text-white/90 hover:text-white hover:underline text-sm font-bold transition cursor-pointer"
              >
                Edit Details
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
