'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateClient,
  updateHealthInsurance,
  updateVehicleInsurance,
  renewHealthClient,
  renewVehicleClient,
  deleteClientFull,
} from '@/lib/api';
import ConvertModal from '@/components/ConvertModal';
import { motion, AnimatePresence } from 'framer-motion';

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

    if (updated.length > nextCount) updated = updated.slice(0, nextCount);
    else while (updated.length < nextCount) updated.push('');

    const newAgesStr = updated.join(', ');

    setHealthPatch({
      ages: newAgesStr,
      floater_type: floaterFromCount(nextCount),
    });
  };

  // ---------------- SAVE ----------------

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

      // VEHICLE UPDATE
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

  // ---------------- ACTIONS ----------------

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

      alert('Renewed');
      window.location.reload();
    } catch {
      alert('Renew failed');
    } finally {
      setRenewing(false);
    }
  };

  const handleDeleteFull = async () => {
    const ok = confirm('Delete this client fully?');

    if (!ok) return;

    try {
      setDeleting(true);

      await deleteClientFull(form.id);

      alert('Deleted');

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
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">

      {editing ? (
        <>
          <h2 className="text-xl font-bold mb-4">Edit Client</h2>

          <input
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="w-full mb-2 p-2 rounded bg-gray-800"
          />

          <input
            value={form.mobile || ''}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="Mobile"
            className="w-full mb-2 p-2 rounded bg-gray-800"
          />

          <input
            value={form.place || ''}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            placeholder="Place"
            className="w-full mb-4 p-2 rounded bg-gray-800"
          />

          {/* HEALTH EDIT */}
          {form.insurance_type === 'health' && (
            <>
              <input
                value={form.health_details?.ages || ''}
                onChange={(e) =>
                  syncFloaterFromAges(e.target.value)
                }
                placeholder="Ages"
                className="w-full mb-2 p-2 rounded bg-gray-800"
              />

              <textarea
                value={form.health_details?.ped || ''}
                onChange={(e) =>
                  setHealthPatch({ ped: e.target.value })
                }
                placeholder="PED"
                className="w-full mb-4 p-2 rounded bg-gray-800"
              />
            </>
          )}

          {/* VEHICLE EDIT */}
          {form.insurance_type === 'vehicle' && (
            <>
              <input
                value={form.vehicle_details?.vehicle_type || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicle_details: {
                      ...form.vehicle_details,
                      vehicle_type: e.target.value,
                    },
                  })
                }
                placeholder="Vehicle Type"
                className="w-full mb-2 p-2 rounded bg-gray-800"
              />

              <input
                value={form.vehicle_details?.insurance_cover || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicle_details: {
                      ...form.vehicle_details,
                      insurance_cover: e.target.value,
                    },
                  })
                }
                placeholder="Insurance Cover"
                className="w-full mb-4 p-2 rounded bg-gray-800"
              />
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white text-black rounded"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">{form.name}</h2>
          <p>📞 {form.mobile}</p>
          <p>📍 {form.place}</p>

          {form.insurance_type === 'vehicle' && (
            <div className="mt-4">
              <p>Vehicle Type: {form.vehicle_details?.vehicle_type}</p>
              <p>
                Insurance Cover: {form.vehicle_details?.insurance_cover}
              </p>
            </div>
          )}

          {form.insurance_type === 'health' && (
            <div className="mt-4">
              <p>Ages: {form.health_details?.ages}</p>
              <p>PED: {form.health_details?.ped}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">

            {!isConverted && (
              <button
                onClick={() => setShowConvert(true)}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Convert
              </button>
            )}

            {!isRenewed && (
              <button
                onClick={handleRenew}
                className="bg-yellow-500 px-3 py-1 rounded"
              >
                Renew
              </button>
            )}

            <button
              onClick={handleDeleteFull}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Delete
            </button>

            <button
              onClick={() => setEditing(true)}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Edit
            </button>
          </div>
        </>
      )}

      {showConvert && (
        <ConvertModal
          clientId={form.id}
          onClose={() => setShowConvert(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}