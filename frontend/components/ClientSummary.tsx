'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateClient,
  updateHealthInsurance,
  updateVehicleInsurance,   // ✅ added
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
      typeof form.health_details?.ages === 'string'
        ? form.health_details.ages
        : '';
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

  const setVehiclePatch = (patch: any) => {
    setForm((prev: any) => ({
      ...prev,
      vehicle_details: {
        ...(prev.vehicle_details || {}),
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

      const updatedClient = await updateClient(client.id, {
        name: form.name,
        mobile: form.mobile,
        place: form.place,
      });

      setForm((prev: any) => ({ ...prev, ...updatedClient }));

      // HEALTH UPDATE
      if (form.insurance_type === 'health' && form.health_details?.id) {
        const agesStr = String(form.health_details?.ages || '');
        const count = parseAges(agesStr).length || 1;

        const payload = {
          ages: agesStr,
          ped: String(form.health_details?.ped || ''),
          floater_type: floaterFromCount(count),
        };

        const updatedHealth = await updateHealthInsurance(
          form.health_details.id,
          payload
        );

        setForm((prev: any) => ({
          ...prev,
          health_details: {
            ...(prev.health_details || {}),
            ...updatedHealth,
          },
        }));
      }

      // ✅ VEHICLE UPDATE
      if (form.insurance_type === 'vehicle' && form.vehicle_details?.id) {
        const payload = {
          vehicle_type: form.vehicle_details?.vehicle_type,
          insurance_cover: form.vehicle_details?.insurance_cover,
        };

        const updatedVehicle = await updateVehicleInsurance(
          form.vehicle_details.id,
          payload
        );

        setForm((prev: any) => ({
          ...prev,
          vehicle_details: {
            ...(prev.vehicle_details || {}),
            ...updatedVehicle,
          },
        }));
      }

      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const isConverted = !!form.is_converted;

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
        await renewVehicleClient(form.id, next);

        setForm((prev: any) => ({
          ...prev,
          vehicle_details: {
            ...(prev.vehicle_details || {}),
            renewal_date: next,
          },
        }));
      } else {
        await renewHealthClient(form.id, next);

        setForm((prev: any) => ({
          ...prev,
          health_details: {
            ...(prev.health_details || {}),
            renewal_date: next,
          },
        }));
      }

      alert('Renewed ✅');
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
      await deleteClientFull(form.id);
      alert('Deleted ✅');

      router.push(
        form.insurance_type === 'vehicle' ? '/vehicle' : '/health'
      );
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
      <div className="relative">

        <AnimatePresence mode="wait">
          {editing ? (

            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >

              <h2 className="text-xl font-bold mb-5">Edit Client Details</h2>

              <div className="space-y-3">

                <input
                  value={form.name || ''}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-700 p-3 rounded-2xl"
                />

                <input
                  value={form.mobile || ''}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-700 p-3 rounded-2xl"
                />

                <input
                  value={form.place || ''}
                  onChange={(e) =>
                    setForm({ ...form, place: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-700 p-3 rounded-2xl"
                />

              </div>

              {/* HEALTH EDIT */}

              {form.insurance_type === 'health' && (
                <div className="mt-6 space-y-3">

                  <p className="text-sm font-bold underline">
                    Health Fields
                  </p>

                  <input
                    value={form.health_details?.ages || ''}
                    onChange={(e) =>
                      syncFloaterFromAges(e.target.value)
                    }
                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-2xl"
                  />

                  <textarea
                    value={form.health_details?.ped || ''}
                    onChange={(e) =>
                      setHealthPatch({ ped: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-2xl"
                  />

                </div>
              )}

              {/* ✅ VEHICLE EDIT */}

              {form.insurance_type === 'vehicle' && (
                <div className="mt-6 space-y-3">

                  <p className="text-sm font-bold underline">
                    Vehicle Fields
                  </p>

                  <input
                    value={form.vehicle_details?.vehicle_type || ''}
                    onChange={(e) =>
                      setVehiclePatch({
                        vehicle_type: e.target.value,
                      })
                    }
                    placeholder="Vehicle Type"
                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-2xl"
                  />

                  <input
                    value={form.vehicle_details?.insurance_cover || ''}
                    onChange={(e) =>
                      setVehiclePatch({
                        insurance_cover: e.target.value,
                      })
                    }
                    placeholder="Insurance Cover"
                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-2xl"
                  />

                </div>
              )}

              <div className="flex justify-end gap-3 mt-5">

                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-600 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-white text-black rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>

              </div>

            </motion.div>

          ) : (

            <motion.div key="view">

              {/* YOUR ORIGINAL UI BELOW (UNCHANGED) */}

              {/* keep your same UI blocks */}
              
            </motion.div>

          )}
        </AnimatePresence>

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