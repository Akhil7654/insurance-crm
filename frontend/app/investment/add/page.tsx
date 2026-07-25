'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createClient,
  createInvestmentDetails,
  createNote,
} from '@/lib/api';
import InvestmentConvertModal from '@/components/InvestmentConvertModal';
import { motion } from 'framer-motion';

const priorityOptions = [
  { value: 'HOT', label: 'Hot', color: '#EF6461' },
  { value: 'WARM', label: 'Warm', color: '#E3A857' },
  { value: 'COOL', label: 'Cool', color: '#5B8DEF' },
] as const;

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .5 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .5 3 1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
    <path d="M4 18h16" />
  </svg>
);

const NoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6 8.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 12.5 6 8.5Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ------------------------------------------------------- */
/* FIELD WRAPPER — amber icon + label, dark input */
/* ------------------------------------------------------- */

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[12px] font-medium text-[#E3A857]">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#E3A857]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3.5 rounded-xl outline-none transition-colors disabled:opacity-50';

export default function InvestmentAddPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [converted, setConverted] = useState(false);

  const [clientId, setClientId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    investment_type: '',
    remarks: '',
  });

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
    priority: 'HOT',
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading || clientId) return;

    if (!form.name || !form.mobile) {
      alert('Fill required fields');
      return;
    }

    try {
      setLoading(true);

      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'investment',
      });

      await createInvestmentDetails({
        client: client.id,
        investment_type: form.investment_type,
        remarks: form.remarks,
      });

      setClientId(client.id);
    } catch {
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!clientId || noteLoading) return;

    if (!note.text || !note.follow_up_date) {
      alert('Enter note and follow-up date');
      return;
    }

    try {
      setNoteLoading(true);

      await createNote({
        client: clientId,
        text: note.text,
        follow_up_date: note.follow_up_date,
        reminder: note.reminder,
        priority: note.priority,
      });

      router.push('/investment');
    } catch {
      alert('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  const finishWithoutNote = () => {
    router.push('/investment');
  };

  return (
    <div className="relative min-h-screen bg-[#05070C] text-[#F4F6FA] overflow-hidden">
      <style>{`
        @keyframes card-glow-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[#E3A857]/[0.08] blur-[120px]"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-xl px-6 py-14 sm:py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#E3A857] uppercase mb-3">
            IN · New Record
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Add Investment Client</h1>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono border ${
                clientId ? 'bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]' : 'bg-[#E3A857]/15 border-[#E3A857]/40 text-[#E3A857]'
              }`}
            >
              {clientId ? <CheckIcon /> : '1'}
            </span>
            <span className={`text-[13px] font-medium ${clientId ? 'text-[#7C879E]' : 'text-[#F4F6FA]'}`}>
              Client details
            </span>
          </div>

          <div className="flex-1 h-px bg-white/[0.08]" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono border ${
                clientId ? 'bg-[#E3A857]/15 border-[#E3A857]/40 text-[#E3A857]' : 'bg-white/[0.04] border-white/[0.1] text-[#565F76]'
              }`}
            >
              2
            </span>
            <span className={`text-[13px] font-medium ${clientId ? 'text-[#F4F6FA]' : 'text-[#565F76]'}`}>
              Note / Convert
            </span>
          </div>
        </motion.div>

        {/* Client details card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6 space-y-4"
        >
          <Field icon={<UserIcon />} label="Client Name">
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              disabled={clientId !== null}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={<PhoneIcon />} label="Phone Number">
              <input
                name="mobile"
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={handleChange}
                disabled={clientId !== null}
                className={inputClass}
              />
            </Field>

            <Field icon={<PinIcon />} label="Place">
              <input
                name="place"
                placeholder="City / town"
                value={form.place}
                onChange={handleChange}
                disabled={clientId !== null}
                className={inputClass}
              />
            </Field>
          </div>

          <Field icon={<TrendingIcon />} label="Investment Type">
            <input
              name="investment_type"
              placeholder="Eg: Mutual Fund / SIP / ULIP"
              value={form.investment_type}
              onChange={handleChange}
              disabled={clientId !== null}
              className={inputClass}
            />
          </Field>

          <Field icon={<NoteIcon />} label="Remarks">
            <textarea
              name="remarks"
              placeholder="Any additional notes about this client..."
              value={form.remarks}
              onChange={handleChange}
              disabled={clientId !== null}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {!clientId && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium text-sm transition-colors bg-[#E3A857] hover:bg-[#d1963f] text-[#05070C] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Client'}
            </button>
          )}

          {clientId && (
            <div className="flex items-center gap-2 text-[#34D399] text-[13px] font-medium pt-1">
              <CheckIcon /> Client saved
            </div>
          )}
        </motion.div>

        {clientId && (
          <>
            {/* Convert lead */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6 mt-4"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                  <TrendingIcon />
                </span>
                <h3 className="text-[15px] font-medium text-[#F4F6FA]">Convert Lead</h3>
              </div>

              {converted ? (
                <div className="flex items-center gap-2 text-[#34D399] text-[13px] font-medium">
                  <CheckIcon /> Lead converted
                </div>
              ) : (
                <button
                  onClick={() => setShowConvert(true)}
                  className="w-full py-3 rounded-xl font-medium text-sm bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 transition-colors"
                >
                  Convert This Lead
                </button>
              )}
            </motion.div>

            {/* Follow-up note */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6 mt-4 space-y-4"
            >
              <h3 className="text-[15px] font-medium text-[#F4F6FA]">Add Follow-up Note</h3>

              <Field icon={<NoteIcon />} label="Note">
                <textarea
                  placeholder="Note details..."
                  value={note.text}
                  onChange={(e) => setNote({ ...note, text: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field icon={<CalendarIcon />} label="Follow-up Date">
                <input
                  type="date"
                  value={note.follow_up_date}
                  onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </Field>

              <label className="flex items-center gap-3 bg-[#0A0E16] border border-white/[0.08] rounded-xl px-3.5 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={note.reminder}
                  onChange={(e) => setNote({ ...note, reminder: e.target.checked })}
                  className="w-4 h-4 accent-[#E3A857]"
                />
                <span className="flex items-center gap-2">
                  <span className="text-[#7C879E]">
                    <BellIcon />
                  </span>
                  <span className="text-[13px] font-medium text-[#F4F6FA]">Enable Reminder</span>
                </span>
              </label>

              <div>
                <p className="text-[13px] font-medium text-[#F4F6FA] mb-2.5">Lead Priority</p>

                <div className="grid grid-cols-3 gap-2.5">
                  {priorityOptions.map((item) => {
                    const active = note.priority === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setNote({ ...note, priority: item.value })}
                        className="relative rounded-lg p-[1px] overflow-hidden"
                      >
                        {active && (
                          <div
                            className="absolute -inset-[40%] opacity-90"
                            style={{
                              background: `conic-gradient(from 0deg, transparent 0%, ${item.color} 16%, transparent 32%)`,
                              animation: 'card-glow-spin 3.2s linear infinite',
                            }}
                          />
                        )}
                        <div
                          className={`relative z-10 rounded-[7px] px-3 py-2.5 border flex items-center justify-center gap-2 transition-colors ${
                            active ? 'bg-[#0F1420] border-white/[0.02]' : 'bg-[#0F1420] border-white/[0.08] hover:border-white/[0.16]'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-[13px] font-medium" style={{ color: active ? item.color : '#7C879E' }}>
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAddNote}
                disabled={noteLoading}
                className="w-full py-3.5 rounded-xl font-medium text-sm bg-[#E3A857] hover:bg-[#d1963f] text-[#05070C] disabled:opacity-50 transition-colors"
              >
                {noteLoading ? 'Saving...' : 'Add Note & Finish'}
              </button>

              <button
                onClick={finishWithoutNote}
                className="w-full py-3 rounded-xl font-medium text-sm bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] transition-colors"
              >
                Finish Without Note
              </button>
            </motion.div>
          </>
        )}
      </div>

      {showConvert && clientId && (
        <InvestmentConvertModal
          clientId={clientId}
          onClose={() => setShowConvert(false)}
          onSuccess={() => setConverted(true)}
        />
      )}
    </div>
  );
}