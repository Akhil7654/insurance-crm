'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getClientHistory,
  getClientDetail,
  createNote,
  updateNote,
  deleteNote,
} from '@/lib/api';

import ClientSummary from '@/components/ClientSummary';
import HistoryTimeline from '@/components/HistoryTimeline';

const priorityOptions = [
  { value: 'HOT', label: 'Hot', color: '#EF6461' },
  { value: 'WARM', label: 'Warm', color: '#E3A857' },
  { value: 'COOL', label: 'Cool', color: '#5B8DEF' },
] as const;

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

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
    <path d="M4 18h16" />
  </svg>
);

export default function InvestmentClientHistoryPage() {
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
    priority: 'HOT',
  });

  useEffect(() => {
    if (!clientId) return;

    getClientDetail(clientId).then((data) => {
      setClient(data);
      setConversions(data.investment_conversions || []);
    });

    getClientHistory(clientId).then(setHistory);
  }, [clientId]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createNote({
        client: clientId,
        ...note,
      });

      // refetch instead of splicing — so reminder toggles on other
      // notes (turned off server-side) are reflected immediately
      const refreshed = await getClientHistory(clientId);
      setHistory(refreshed);

      setNote({
        text: '',
        follow_up_date: '',
        reminder: true,
        priority: 'HOT',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNoteUpdate = async (
    noteObj: any,
    text: string,
    reminder: boolean,
    priority: 'HOT' | 'WARM' | 'COOL'
  ) => {
    await updateNote(noteObj.id, { text, reminder, priority });

    const refreshed = await getClientHistory(clientId);
    setHistory(refreshed);
  };

  const handleNoteDelete = async (noteObj: any) => {
    await deleteNote(noteObj.id);
    setHistory((prev) => prev.filter((n) => n.id !== noteObj.id));
  };

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070C]">
        <div className="flex items-center gap-3 text-[#7C879E] text-sm font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5B8DEF] animate-pulse" />
          Loading client details…
        </div>
      </div>
    );

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
        className="pointer-events-none absolute -top-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#5B8DEF]/[0.08] blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-14 sm:py-20 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ClientSummary client={client} />
        </motion.div>

        {conversions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34D399]/[0.12] text-[#34D399]">
                <TrendingIcon />
              </span>
              <h2 className="text-[15px] font-medium text-[#F4F6FA]">Converted Lead Details</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13px] text-[#EDEFF3]">
                <thead>
                  <tr className="bg-white/[0.03] text-[#7C879E] font-mono text-[11px] uppercase tracking-wide">
                    <th className="p-3 text-left font-medium">POSP</th>
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Amount</th>
                    <th className="p-3 text-left font-medium">Policy</th>
                    <th className="p-3 text-left font-medium">Term</th>
                    <th className="p-3 text-left font-medium">Renewal</th>
                  </tr>
                </thead>

                <tbody>
                  {conversions.map((c: any, i: number) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        i !== conversions.length - 1 ? 'border-b border-white/[0.06]' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-[#7C879E]">{c.posp_code}</td>
                      <td className="p-3">{c.company_name}</td>
                      <td className="p-3 font-mono">₹{c.investment_amount}</td>
                      <td className="p-3">{c.policy_name}</td>
                      <td className="p-3 text-[#7C879E]">{c.investment_paying_term}</td>
                      <td className="p-3 text-[#E3A857]">{c.renewal_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6"
        >
          <h2 className="text-[15px] font-medium text-[#F4F6FA] mb-5">Add New Follow-up Note</h2>

          <form onSubmit={handleAddNote} className="space-y-4">
            <textarea
              required
              value={note.text}
              onChange={(e) => setNote({ ...note, text: e.target.value })}
              placeholder="Write your follow-up note..."
              rows={3}
              className="w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3.5 rounded-xl outline-none transition-colors resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#7C879E]">Follow-up Date</label>

                <div className="flex items-center gap-2.5 bg-[#0A0E16] border border-white/[0.08] focus-within:border-[#5B8DEF]/50 rounded-xl px-3.5 py-3 transition-colors">
                  <span className="text-[#565F76]">
                    <CalendarIcon />
                  </span>
                  <input
                    type="date"
                    required
                    value={note.follow_up_date}
                    onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                    className="w-full bg-transparent text-[#F4F6FA] text-sm outline-none [color-scheme:dark]"
                  />
                </div>

                {note.follow_up_date && (
                  <p className="text-[11px] text-[#565F76] font-mono">
                    Selected: {formatDate(note.follow_up_date)}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 bg-[#0A0E16] border border-white/[0.08] rounded-xl px-3.5 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={note.reminder}
                  onChange={(e) => setNote({ ...note, reminder: e.target.checked })}
                  className="w-4 h-4 accent-[#5B8DEF]"
                />

                <span className="flex items-center gap-2">
                  <span className="text-[#7C879E]">
                    <BellIcon />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-[#F4F6FA]">Enable Reminder</span>
                    <span className="block text-[11px] text-[#7C879E]">Notify on follow-up date</span>
                  </span>
                </span>
              </label>

              <div className="sm:col-span-2 bg-[#0A0E16] border border-white/[0.08] rounded-xl p-4">
                <p className="text-[13px] font-medium text-[#F4F6FA] mb-3">Lead Priority</p>

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
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: active ? item.color : '#7C879E' }}
                          >
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B8DEF] hover:bg-[#4a7ce0] disabled:opacity-50 transition-colors text-white py-3 rounded-xl text-sm font-medium"
            >
              {loading ? 'Saving...' : 'Add Note'}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <HistoryTimeline
            notes={history}
            onNoteUpdate={handleNoteUpdate}
            onNoteDelete={handleNoteDelete}
          />
        </motion.div>
      </div>
    </div>
  );
}