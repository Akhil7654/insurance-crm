'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createClient,
  createHealthInsurance,
  createNote,
  createQuote,
  updateQuote,
  deleteQuote,
} from '@/lib/api';
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

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="9" cy="8" r="2.8" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
    <circle cx="17" cy="9" r="2.2" />
    <path d="M14.5 14.2c2-.1 4 1.6 4.3 4.3" />
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

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="m20.6 12.6-8 8a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 12.8 3H19a1 1 0 0 1 1 1v6.2a2 2 0 0 1-.4 1.4Z" />
    <circle cx="15.5" cy="8.5" r="1.2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 6 9 17l-5-5" />
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
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#E3A857]/50 text-[#F4F6FA] placeholder:text-[#E3A857]/40 text-sm p-3.5 rounded-xl outline-none transition-colors disabled:opacity-50';

export default function AddHealthClientPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [clientId, setClientId] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    floater_type: 'individual',
    agesText: '',
    ped: '',
    renewal_date: '',
  });

  const [quote, setQuote] = useState({
    company_name: '',
    premium_amount: '',
  });

  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editQuote, setEditQuote] = useState({
    company_name: '',
    premium_amount: '',
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

  const parseAges = (agesText: string) => {
    return agesText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n > 0);
  };

  const handleSubmit = async () => {
    if (loading || clientId) return;

    const agesArray = parseAges(form.agesText);

    if (!form.name || !form.mobile) {
      alert('Fill client name and mobile number');
      return;
    }

    if (form.floater_type === 'individual' && agesArray.length !== 1) {
      alert('For Individual, enter exactly 1 age');
      return;
    }

    if (form.floater_type === 'family' && agesArray.length < 2) {
      alert('For Family, enter 2 or more ages');
      return;
    }

    try {
      setLoading(true);

      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'health',
      });

      await createHealthInsurance({
        client: client.id,
        floater_type: form.floater_type,
        ages: agesArray.join(','),
        ped: form.ped,
        renewal_date: form.renewal_date || null,
      });

      setClientId(client.id);
    } catch (err) {
      alert('Error saving data');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async () => {
    if (!clientId || quoteLoading) return;

    if (!quote.company_name || !quote.premium_amount) {
      alert('Enter company and premium amount');
      return;
    }

    try {
      setQuoteLoading(true);

      const newQuote = await createQuote({
        client: clientId,
        company_name: quote.company_name,
        premium_amount: Number(quote.premium_amount),
      });

      setQuotes((prev) => [newQuote, ...prev]);
      setQuote({ company_name: '', premium_amount: '' });
    } catch {
      alert('Failed to add quote');
    } finally {
      setQuoteLoading(false);
    }
  };

  const startEditQuote = (q: any) => {
    setEditingQuoteId(q.id);
    setEditQuote({
      company_name: q.company_name || '',
      premium_amount: String(q.premium_amount ?? ''),
    });
  };

  const cancelEditQuote = () => {
    setEditingQuoteId(null);
    setEditQuote({
      company_name: '',
      premium_amount: '',
    });
  };

  const handleSaveQuote = async () => {
    if (!editingQuoteId) return;

    if (!editQuote.company_name || !editQuote.premium_amount) {
      alert('Enter company and premium amount');
      return;
    }

    try {
      const updated = await updateQuote(editingQuoteId, {
        company_name: editQuote.company_name,
        premium_amount: Number(editQuote.premium_amount),
      });

      setQuotes((prev) =>
        prev.map((q) => (q.id === editingQuoteId ? updated : q))
      );

      cancelEditQuote();
    } catch {
      alert('Failed to update quote');
    }
  };

  const handleDeleteQuote = async (id: number) => {
    const ok = confirm('Delete this quote?');
    if (!ok) return;

    try {
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert('Failed to delete quote');
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

      router.push('/health');
    } catch {
      alert('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  const finishWithoutNote = () => {
    router.push('/health');
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
            HL · New Record
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Add Health Insurance Client</h1>
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
              Quotes / Note
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
            <Field icon={<PhoneIcon />} label="Mobile Number">
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

          <Field icon={<UsersIcon />} label="Floater Type">
            <select
              name="floater_type"
              value={form.floater_type}
              onChange={handleChange}
              disabled={clientId !== null}
              className={inputClass}
            >
              <option className="bg-[#0A0E16]" value="individual">Individual</option>
              <option className="bg-[#0A0E16]" value="family">Family</option>
            </select>
          </Field>

          <Field icon={<HeartIcon />} label={form.floater_type === 'individual' ? 'Age' : 'Ages'}>
            <input
              name="agesText"
              placeholder={form.floater_type === 'individual' ? 'Eg: 28' : 'Eg: 30, 28, 5'}
              value={form.agesText}
              onChange={handleChange}
              disabled={clientId !== null}
              className={inputClass}
            />
          </Field>

          <Field icon={<CalendarIcon />} label="Renewal Date">
            <input
              type="date"
              name="renewal_date"
              value={form.renewal_date}
              onChange={handleChange}
              disabled={clientId !== null}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </Field>

          <Field icon={<NoteIcon />} label="PED (Pre-existing Disease)">
            <textarea
              name="ped"
              placeholder="Any pre-existing conditions..."
              value={form.ped}
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
            {/* Quotes */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6 mt-4"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                  <TagIcon />
                </span>
                <h3 className="text-[15px] font-medium text-[#F4F6FA]">Add Quotes</h3>
              </div>

              <div className="space-y-3">
                <Field icon={<TagIcon />} label="Company Name">
                  <input
                    placeholder="Insurer name"
                    value={quote.company_name}
                    onChange={(e) => setQuote({ ...quote, company_name: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field icon={<TagIcon />} label="Premium Amount">
                  <input
                    type="number"
                    placeholder="Amount in ₹"
                    value={quote.premium_amount}
                    onChange={(e) => setQuote({ ...quote, premium_amount: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <button
                  onClick={handleAddQuote}
                  disabled={quoteLoading}
                  className="w-full py-3 rounded-xl font-medium text-sm bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 transition-colors disabled:opacity-50"
                >
                  {quoteLoading ? 'Adding...' : 'Add Quote'}
                </button>
              </div>

              {quotes.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  {quotes.map((q) => (
                    <div key={q.id} className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-4">
                      {editingQuoteId === q.id ? (
                        <div className="space-y-3">
                          <input
                            value={editQuote.company_name}
                            onChange={(e) => setEditQuote({ ...editQuote, company_name: e.target.value })}
                            className={inputClass}
                            placeholder="Company Name"
                          />
                          <input
                            type="number"
                            value={editQuote.premium_amount}
                            onChange={(e) => setEditQuote({ ...editQuote, premium_amount: e.target.value })}
                            className={inputClass}
                            placeholder="Premium Amount"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveQuote}
                              className="bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditQuote}
                              className="bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-3">
                          <div>
                            <p className="font-medium text-[14px] text-[#F4F6FA]">{q.company_name}</p>
                            <p className="text-[#7C879E] text-[13px] font-mono">₹{q.premium_amount}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditQuote(q)}
                              className="flex items-center gap-1.5 bg-[#E3A857]/10 hover:bg-[#E3A857]/20 text-[#E3A857] border border-[#E3A857]/30 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                            >
                              <PencilIcon /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(q.id)}
                              className="flex items-center gap-1.5 bg-[#EF6461]/10 hover:bg-[#EF6461]/20 text-[#EF6461] border border-[#EF6461]/30 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                            >
                              <TrashIcon /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
    </div>
  );
}