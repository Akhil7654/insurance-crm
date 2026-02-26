'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateClient,
  updateHealthInsurance,
  renewHealthClient,
  renewVehicleClient,
  deleteClientFull,
} from '@/lib/api';
import ConvertModal from '@/components/ConvertModal';
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

function parseAges(input: string): string[] {
  return String(input || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function floaterFromCount(count: number) {
  return count === 1 ? 'individual' : 'family';
}

// “Already Renewed” rule:
// - if renewal_date exists AND it is today/future => renewed ✅
// - else => not renewed ❌
function isRenewedByDate(renewalDate?: string | null) {
  if (!renewalDate) return false;
  const d = new Date(renewalDate);
  if (Number.isNaN(d.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  d.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

export default function ClientSummary({ client }: any) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(client);
  const [saving, setSaving] = useState(false);

  const [showConvert, setShowConvert] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const agesArr = useMemo(() => {
    const agesStr =
      typeof form.health_details?.ages === 'string' ? form.health_details.ages : '';
    return parseAges(agesStr);
  }, [form.health_details?.ages]);

  const setHealthPatch = (patch: any) => {
    setForm((prev: any) => ({
      ...prev,
      health_details: {
        ...(prev.health_details || {}),
        ...patch,
      },
    }));
  };

  const syncFloaterFromAges = (agesStr: string) => {
    const count = parseAges(agesStr).length || 1;
    setHealthPatch({
      ages: agesStr,
      floater_type: floaterFromCount(count),
    });
  };

  const handleTotalMembersChange = (nextCountRaw: string) => {
    const nextCount = Math.max(1, Number(nextCountRaw || 1));

    const current = parseAges(form.health_details?.ages || '');
    let updated = [...current];

    if (updated.length > nextCount) {
      updated = updated.slice(0, nextCount);
    } else {
      while (updated.length < nextCount) updated.push('');
    }

    const newAgesStr = updated.join(', ');
    setHealthPatch({
      ages: newAgesStr,
      floater_type: floaterFromCount(nextCount),
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1) base client update
      const updatedClient = await updateClient(client.id, {
        name: form.name,
        mobile: form.mobile,
        place: form.place,
      });
      setForm((prev: any) => ({ ...prev, ...updatedClient }));

      // 2) health extra update (ages/ped/floater)
      if (form.insurance_type === 'health' && form.health_details?.id) {
        const agesStr = String(form.health_details?.ages || '');
        const count = parseAges(agesStr).length || 1;

        const payload = {
          ages: agesStr,
          ped: String(form.health_details?.ped || ''),
          floater_type: floaterFromCount(count),
        };

        const updatedHealth = await updateHealthInsurance(form.health_details.id, payload);

        setForm((prev: any) => ({
          ...prev,
          health_details: {
            ...(prev.health_details || {}),
            ...updatedHealth,
          },
        }));
      }

      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- ACTIONS (Convert / Renew / Delete) ----------------

  const isConverted = !!form.is_converted; // from Client model :contentReference[oaicite:4]{index=4}
  const renewalDate =
    form.insurance_type === 'vehicle'
      ? form.vehicle_details?.renewal_date
      : form.health_details?.renewal_date;

  const isRenewed = isRenewedByDate(renewalDate);

  const handleRenew = async () => {
    const next = prompt('Enter Next Renewal Date (YYYY-MM-DD)');
    if (!next) return;

    try {
      setRenewing(true);

      if (form.insurance_type === 'vehicle') {
        await renewVehicleClient(form.id, next); // exists in api.ts :contentReference[oaicite:5]{index=5}
        setForm((prev: any) => ({
          ...prev,
          vehicle_details: { ...(prev.vehicle_details || {}), renewal_date: next },
        }));
      } else {
        await renewHealthClient(form.id, next); // used similarly in health page :contentReference[oaicite:6]{index=6}
        setForm((prev: any) => ({
          ...prev,
          health_details: { ...(prev.health_details || {}), renewal_date: next },
        }));
      }

      alert('Renewed ✅');
      // optional: reload to refresh tables in history page
      window.location.reload();
    } catch {
      alert('Renew failed');
    } finally {
      setRenewing(false);
    }
  };

  const handleDeleteFull = async () => {
    const ok = confirm('Delete this client fully? This removes all data.');
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteClientFull(form.id); // exists :contentReference[oaicite:7]{index=7}
      alert('Deleted ✅');
      router.push(form.insurance_type === 'vehicle' ? '/vehicle' : '/health');
    } catch {
      alert('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

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

              {/* Basic fields */}
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

              {/* Health edit fields */}
              {form.insurance_type === 'health' && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-bold text-gray-200 underline">Health Fields</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs mb-2">Total Members</p>
                      <input
                        type="number"
                        min={1}
                        value={Math.max(1, parseAges(form.health_details?.ages || '').length || 1)}
                        onChange={(e) => handleTotalMembersChange(e.target.value)}
                        className="w-full bg-gray-900/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Floater Type auto:{' '}
                        <b>
                          {floaterFromCount(
                            Math.max(1, parseAges(form.health_details?.ages || '').length || 1)
                          ).toUpperCase()}
                        </b>
                      </p>
                    </div>

                    <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs mb-2">Ages (comma separated)</p>
                      <input
                        type="text"
                        value={form.health_details?.ages || ''}
                        onChange={(e) => syncFloaterFromAges(e.target.value)}
                        placeholder="Eg: 28, 26, 4"
                        className="w-full bg-gray-900/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3">
                    <p className="text-gray-400 text-xs mb-2">PED (Pre-existing Disease)</p>
                    <textarea
                      value={form.health_details?.ped || ''}
                      onChange={(e) => setHealthPatch({ ped: e.target.value })}
                      placeholder="Type PED details..."
                      rows={4}
                      className="w-full bg-gray-900/60 border border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-700 outline-none p-3 rounded-2xl font-medium text-white"
                    />
                  </div>
                </div>
              )}

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
                  <h2 className="text-2xl font-extrabold tracking-tight">{form.name}</h2>
                  <p className="text-gray-200">📞 {form.mobile}</p>
                  <p className="text-gray-200">📍 {form.place}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      className="text-xs bg-gray-800/80 border border-gray-700 px-3 py-1 rounded-full font-bold"
                    >
                      {String(form.insurance_type || '').toUpperCase()}
                    </motion.span>

                    {isConverted && (
                      <motion.span
                        whileHover={{ scale: 1.06 }}
                        className="text-xs bg-lime-50 text-green-950 px-3 py-1 rounded-full font-bold"
                      >
                        Converted 🏆
                      </motion.span>
                    )}

                    {renewalDate && (
                      <motion.span
                        whileHover={{ scale: 1.06 }}
                        className="text-xs bg-yellow-900/40 border border-yellow-800 px-3 py-1 rounded-full font-bold text-yellow-200"
                      >
                        Renewal: {renewalDate}
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

              {/* Health info block (same as before) */}
              {form.insurance_type === 'health' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="mt-5 pt-4 border-t border-gray-800 text-sm bg-gray-950/70 rounded-2xl p-4"
                >
                  <p className="font-bold mb-3 text-white underline">Health Information</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs">Total Members</p>
                      <p className="text-white font-bold">{agesArr.length || 0}</p>
                    </div>

                    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs">Floater</p>
                      <p className="text-white font-bold">
                        {form.health_details?.floater_type === 'family'
                          ? 'FAMILY FLOATER'
                          : 'INDIVIDUAL'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-2">Ages</p>
                    {agesArr.length === 0 ? (
                      <p className="text-gray-300">No ages added</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {agesArr.map((age: string, idx: number) => (
                          <span
                            key={`${age}-${idx}`}
                            className="text-sm font-bold bg-blue-900/40 border border-blue-800 text-blue-200 px-3 py-1 rounded-full shadow-sm"
                          >
                            {age} yrs
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                    <p className="text-gray-400 text-xs mb-1">PED</p>
                    <p className="text-white font-medium whitespace-pre-wrap">
                      {form.health_details?.ped?.trim() ? form.health_details.ped : 'No PED'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Vehicle info block */}
              {form.insurance_type === 'vehicle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="mt-5 pt-4 border-t border-gray-800 text-sm bg-gray-950/70 rounded-2xl p-4"
                >
                  <p className="font-bold mb-3 text-white underline">Vehicle Information</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs">Vehicle Type</p>
                      <p className="text-white font-bold">
                        {form.vehicle_details?.vehicle_type || '-'}
                      </p>
                    </div>

                    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                      <p className="text-gray-400 text-xs">Insurance Cover</p>
                      <p className="text-white font-bold">
                        {form.vehicle_details?.insurance_cover || '-'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ✅ ACTION BUTTONS (your new requirement) */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                {!isConverted && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowConvert(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                  >
                    Convert
                  </motion.button>
                )}

                {!isRenewed && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={renewing}
                    onClick={handleRenew}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-60"
                  >
                    {renewing ? 'Renewing...' : 'Renew'}
                  </motion.button>
                )}

                {/* Delete always visible (all cases) */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={deleting}
                  onClick={handleDeleteFull}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setEditing(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                >
                  Edit Details
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Convert Modal */}
        {showConvert && (
          <ConvertModal
            clientId={form.id}
            onClose={() => setShowConvert(false)}
            onSuccess={() => window.location.reload()}
          />
        )}
      </div>
    </motion.div>
  );
}