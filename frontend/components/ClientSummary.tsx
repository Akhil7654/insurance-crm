'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateClient,
  updateHealthInsurance,
  updateVehicleInsurance,
  updateInvestmentDetails,
  renewHealthClient,
  renewVehicleClient,
  renewInvestmentClient,
  deleteClientFull,
} from '@/lib/api';
import ConvertModal from '@/components/ConvertModal';
import InvestmentConvertModal from './InvestmentConvertModal';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .5 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .5 3 1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .5 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .5 3 1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const CheckBadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 16h16v-3.2a1 1 0 0 0-.6-.92L17 10l-1.6-3.6A2 2 0 0 0 13.6 5H10.4a2 2 0 0 0-1.8 1.4L7 10l-2.4 1.88a1 1 0 0 0-.6.92V16Z" />
    <path d="M4 12.5h16" />
    <circle cx="7.5" cy="16" r="1.75" />
    <circle cx="16.5" cy="16" r="1.75" />
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
    <path d="M4 18h16" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
);

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

const inputClass =
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3 rounded-xl outline-none transition-colors';

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
      health_details: { ...(prev.health_details || {}), ...patch },
    }));
  };

  const setVehiclePatch = (patch: any) => {
    setForm((prev: any) => ({
      ...prev,
      vehicle_details: { ...(prev.vehicle_details || {}), ...patch },
    }));
  };

  const setInvestmentPatch = (patch: any) => {
    setForm((prev: any) => ({
      ...prev,
      investment_details: { ...(prev.investment_details || {}), ...patch },
    }));
  };

  const syncFloaterFromAges = (agesStr: string) => {
    const count = parseAges(agesStr).length || 1;
    setHealthPatch({ ages: agesStr, floater_type: floaterFromCount(count) });
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
    setHealthPatch({ ages: newAgesStr, floater_type: floaterFromCount(nextCount) });
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
          health_details: { ...(prev.health_details || {}), ...updatedHealth },
        }));
      }

      if (form.insurance_type === 'vehicle' && form.vehicle_details?.id) {
        const payload = {
          vehicle_type: form.vehicle_details?.vehicle_type || '',
          insurance_cover: form.vehicle_details?.insurance_cover || '',
        };

        const updatedVehicle = await updateVehicleInsurance(form.vehicle_details.id, payload);
        setForm((prev: any) => ({
          ...prev,
          vehicle_details: { ...(prev.vehicle_details || {}), ...updatedVehicle },
        }));
      }

      if (form.insurance_type === 'investment' && form.investment_details?.id) {
        const payload = {
          investment_type: form.investment_details?.investment_type || '',
          remarks: form.investment_details?.remarks || '',
        };

        const updatedInvestment = await updateInvestmentDetails(form.investment_details.id, payload);
        setForm((prev: any) => ({
          ...prev,
          investment_details: { ...(prev.investment_details || {}), ...updatedInvestment },
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
      : form.insurance_type === 'health'
      ? form.health_details?.renewal_date
      : form.investment_details?.renewal_date;

  const isRenewed = isRenewedByDate(renewalDate);

  const typeMeta =
    form.insurance_type === 'vehicle'
      ? { icon: <CarIcon />, label: 'Vehicle' }
      : form.insurance_type === 'health'
      ? { icon: <HeartIcon />, label: 'Health' }
      : { icon: <TrendingIcon />, label: 'Investment' };

  const handleRenew = async () => {
    const next = prompt('Enter Next Renewal Date (YYYY-MM-DD)');
    if (!next) return;

    try {
      setRenewing(true);

      if (form.insurance_type === 'vehicle') {
        await renewVehicleClient(form.id, next);
        setForm((prev: any) => ({
          ...prev,
          vehicle_details: { ...(prev.vehicle_details || {}), renewal_date: next },
        }));
      } else if (form.insurance_type === 'health') {
        await renewHealthClient(form.id, next);
        setForm((prev: any) => ({
          ...prev,
          health_details: { ...(prev.health_details || {}), renewal_date: next },
        }));
      } else {
        await renewInvestmentClient(form.id, next);
        setForm((prev: any) => ({
          ...prev,
          investment_details: { ...(prev.investment_details || {}), renewal_date: next },
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
        form.insurance_type === 'vehicle'
          ? '/vehicle'
          : form.insurance_type === 'health'
          ? '/health'
          : '/investment'
      );
    } catch {
      alert('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-[1px] overflow-hidden">
      <div
        className="absolute -inset-[30%] opacity-40 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #5B8DEF 10%, transparent 24%)',
          animation: 'card-glow-spin 6s linear infinite',
        }}
      />
      <style>{`@keyframes card-glow-spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="relative z-10 bg-[#0F1420] border border-white/[0.06] rounded-[15px] p-6"
      >
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-[16px] font-medium text-[#F4F6FA] mb-5">Edit Client Details</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Client Name"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={form.mobile || ''}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="Mobile Number"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={form.place || ''}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="Location"
                  className={inputClass}
                />
              </div>

              {form.insurance_type === 'health' && (
                <div className="mt-6 space-y-3">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide">Health Fields</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                      <p className="text-[#7C879E] text-[11px] mb-2">Total Members</p>
                      <input
                        type="number"
                        min={1}
                        value={Math.max(1, parseAges(form.health_details?.ages || '').length || 1)}
                        onChange={(e) => handleTotalMembersChange(e.target.value)}
                        className={inputClass}
                      />
                      <p className="text-[11px] text-[#565F76] mt-2">
                        Floater Type auto:{' '}
                        <b className="text-[#7C879E]">
                          {floaterFromCount(
                            Math.max(1, parseAges(form.health_details?.ages || '').length || 1)
                          ).toUpperCase()}
                        </b>
                      </p>
                    </div>

                    <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                      <p className="text-[#7C879E] text-[11px] mb-2">Ages (comma separated)</p>
                      <input
                        type="text"
                        value={form.health_details?.ages || ''}
                        onChange={(e) => syncFloaterFromAges(e.target.value)}
                        placeholder="Eg: 28, 26, 4"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                    <p className="text-[#7C879E] text-[11px] mb-2">PED (Pre-existing Disease)</p>
                    <textarea
                      value={form.health_details?.ped || ''}
                      onChange={(e) => setHealthPatch({ ped: e.target.value })}
                      placeholder="Type PED details..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {form.insurance_type === 'vehicle' && (
                <div className="mt-6 space-y-3">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide">Vehicle Fields</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                      <p className="text-[#7C879E] text-[11px] mb-2">Vehicle Type</p>
                      <input
                        type="text"
                        value={form.vehicle_details?.vehicle_type || ''}
                        onChange={(e) => setVehiclePatch({ vehicle_type: e.target.value })}
                        placeholder="Eg: Two Wheeler"
                        className={inputClass}
                      />
                    </div>

                    <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                      <p className="text-[#7C879E] text-[11px] mb-2">Insurance Cover</p>
                      <select
                        value={form.vehicle_details?.insurance_cover || ''}
                        onChange={(e) => setVehiclePatch({ insurance_cover: e.target.value })}
                        className={inputClass}
                      >
                        <option className="bg-[#0A0E16]" value="">Select Cover</option>
                        <option className="bg-[#0A0E16]" value="full">Full</option>
                        <option className="bg-[#0A0E16]" value="third_party">Third Party</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {form.insurance_type === 'investment' && (
                <div className="mt-6 space-y-3">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide">Investment Fields</p>

                  <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                    <p className="text-[#7C879E] text-[11px] mb-2">Investment Type</p>
                    <input
                      type="text"
                      value={form.investment_details?.investment_type || ''}
                      onChange={(e) => setInvestmentPatch({ investment_type: e.target.value })}
                      placeholder="Eg: Mutual Fund / SIP / ULIP"
                      className={inputClass}
                    />
                  </div>

                  <div className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-3">
                    <p className="text-[#7C879E] text-[11px] mb-2">Remarks</p>
                    <textarea
                      value={form.investment_details?.remarks || ''}
                      onChange={(e) => setInvestmentPatch({ remarks: e.target.value })}
                      placeholder="Type remarks..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 mt-5">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#5B8DEF] hover:bg-[#4a7ce0] text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
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
                <motion.div variants={fadeUp} className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                      {typeMeta.icon}
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight text-[#F4F6FA] truncate">{form.name}</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#7C879E] pl-[46px]">
                    <span className="flex items-center gap-1.5">
                      <PhoneIcon /> {form.mobile}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PinIcon /> {form.place}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2.5 pl-[46px]">
                    <span className="text-[11px] font-mono text-[#7C879E] bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {typeMeta.label}
                    </span>

                    {isConverted && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30 px-2.5 py-1 rounded-full">
                        <CheckBadgeIcon /> Converted
                      </span>
                    )}

                    {renewalDate && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#E3A857] bg-[#E3A857]/10 border border-[#E3A857]/30 px-2.5 py-1 rounded-full">
                        <CalendarIcon /> Renewal: {renewalDate}
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.a
                  variants={fadeUp}
                  href={`tel:${form.mobile}`}
                  className="flex items-center gap-1.5 justify-center bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
                >
                  <CallIcon /> Call Client
                </motion.a>
              </motion.div>

              {/* Health info block */}
              {form.insurance_type === 'health' && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide mb-3">Health Information</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[#7C879E] text-[11px]">Total Members</p>
                      <p className="text-[#F4F6FA] font-mono text-[15px] mt-0.5">{agesArr.length || 0}</p>
                    </div>

                    <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[#7C879E] text-[11px]">Floater</p>
                      <p className="text-[#F4F6FA] font-medium text-[14px] mt-0.5">
                        {form.health_details?.floater_type === 'family' ? 'Family Floater' : 'Individual'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-[#7C879E] text-[11px] mb-2">Ages</p>
                    {agesArr.length === 0 ? (
                      <p className="text-[#565F76] text-sm">No ages added</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {agesArr.map((age: string, idx: number) => (
                          <span
                            key={`${age}-${idx}`}
                            className="text-[12px] font-mono font-medium bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 text-[#5B8DEF] px-2.5 py-1 rounded-full"
                          >
                            {age} yrs
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                    <p className="text-[#7C879E] text-[11px] mb-1">PED</p>
                    <p className="text-[#F4F6FA] text-[14px] whitespace-pre-wrap">
                      {form.health_details?.ped?.trim() ? form.health_details.ped : 'No PED'}
                    </p>
                  </div>
                </div>
              )}

              {/* Vehicle info block */}
              {form.insurance_type === 'vehicle' && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide mb-3">Vehicle Information</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[#7C879E] text-[11px]">Vehicle Type</p>
                      <p className="text-[#F4F6FA] font-medium text-[14px] mt-0.5">
                        {form.vehicle_details?.vehicle_type || '-'}
                      </p>
                    </div>

                    <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[#7C879E] text-[11px]">Insurance Cover</p>
                      <p className="text-[#F4F6FA] font-medium text-[14px] mt-0.5">
                        {form.vehicle_details?.insurance_cover || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment info block */}
              {form.insurance_type === 'investment' && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-[12px] font-medium text-[#5B8DEF] uppercase tracking-wide mb-3">Investment Information</p>

                  <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5 mb-3">
                    <p className="text-[#7C879E] text-[11px]">Investment Type</p>
                    <p className="text-[#F4F6FA] font-medium text-[14px] mt-0.5">
                      {form.investment_details?.investment_type || '-'}
                    </p>
                  </div>

                  <div className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-3.5">
                    <p className="text-[#7C879E] text-[11px] mb-1">Remarks</p>
                    <p className="text-[#F4F6FA] text-[14px] whitespace-pre-wrap">
                      {form.investment_details?.remarks?.trim() ? form.investment_details.remarks : 'No remarks'}
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="mt-5 pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                {!isConverted && (
                  <button
                    onClick={() => setShowConvert(true)}
                    className="bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 font-medium px-4 py-2 rounded-lg text-[13px] transition-colors"
                  >
                    Convert
                  </button>
                )}

                {!isRenewed && (
                  <button
                    disabled={renewing}
                    onClick={handleRenew}
                    className="bg-[#E3A857]/10 hover:bg-[#E3A857]/20 text-[#E3A857] border border-[#E3A857]/30 font-medium px-4 py-2 rounded-lg text-[13px] transition-colors disabled:opacity-50"
                  >
                    {renewing ? 'Renewing...' : 'Renew'}
                  </button>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] font-medium px-4 py-2 rounded-lg text-[13px] transition-colors"
                >
                  <PencilIcon /> Edit Details
                </button>

                <button
                  disabled={deleting}
                  onClick={handleDeleteFull}
                  className="flex items-center gap-1.5 bg-[#EF6461]/10 hover:bg-[#EF6461]/20 text-[#EF6461] border border-[#EF6461]/30 font-medium px-4 py-2 rounded-lg text-[13px] transition-colors disabled:opacity-50 ml-auto"
                >
                  <TrashIcon /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showConvert && form.insurance_type === 'investment' && (
          <InvestmentConvertModal
            clientId={form.id}
            onClose={() => setShowConvert(false)}
            onSuccess={() => window.location.reload()}
          />
        )}

        {showConvert && form.insurance_type !== 'investment' && (
          <ConvertModal
            clientId={form.id}
            onClose={() => setShowConvert(false)}
            onSuccess={() => window.location.reload()}
          />
        )}
      </motion.div>
    </div>
  );
}