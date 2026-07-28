'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getClientHistory,
  getClientDetail,
  createNote,
  updateNote,
  deleteNote,
  createEmiDetails,
  updateEmiDetails,
  deleteEmiDetails,
} from '@/lib/api';

import ClientSummary from '@/components/ClientSummary';
import HistoryTimeline from '@/components/HistoryTimeline';
import QuotesSection from '@/components/QuotesSection';

const priorityOptions = [
  { value: 'HOT', label: 'Hot', color: '#EF6461' },
  { value: 'WARM', label: 'Warm', color: '#E3A857' },
  { value: 'COOL', label: 'Cool', color: '#5B8DEF' },
] as const;

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5V9h-3.5a2.5 2.5 0 0 0 0 5H19v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 15.5v-8Z" />
    <path d="M19 9.5h-3a1.5 1.5 0 0 0 0 3h3" />
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

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="m20.6 12.6-8 8a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 12.8 3H19a1 1 0 0 1 1 1v6.2a2 2 0 0 1-.4 1.4Z" />
    <circle cx="15.5" cy="8.5" r="1.2" />
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

const inputClass =
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3 rounded-xl outline-none transition-colors';

const emptyEmiForm = {
  emi_provider: '',
  down_payment: '',
  emi_amount: '',
  policy_tenure: '',
  emi_tenure: '',
  monthly_emi_amount: '',
};

export default function HealthClientHistoryPage() {
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------- EMI (multiple) ----------------
  const [showAddEmi, setShowAddEmi] = useState(false);
  const [addEmiLoading, setAddEmiLoading] = useState(false);
  const [newEmi, setNewEmi] = useState(emptyEmiForm);

  const [editingEmiId, setEditingEmiId] = useState<number | null>(null);
  const [editEmi, setEditEmi] = useState(emptyEmiForm);
  const [savingEmiId, setSavingEmiId] = useState<number | null>(null);
  const [deletingEmiId, setDeletingEmiId] = useState<number | null>(null);

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
    priority: 'HOT',
  });

  const loadClient = async () => {
    const data = await getClientDetail(clientId);
    setClient(data);
    setConversions(data.conversions || []);
  };

  useEffect(() => {
    if (!clientId) return;
    loadClient();
    getClientHistory(clientId).then(setHistory);
  }, [clientId]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const emiList: any[] = client?.emi_details || [];

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createNote({
        client: clientId,
        ...note,
      });

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

  // ---------------- EMI handlers ----------------

  const handleAddEmi = async () => {
    if (addEmiLoading) return;

    try {
      setAddEmiLoading(true);

      await createEmiDetails({
        client: clientId,
        emi_provider: newEmi.emi_provider,
        down_payment: newEmi.down_payment === '' ? null : newEmi.down_payment,
        emi_amount: newEmi.emi_amount === '' ? null : newEmi.emi_amount,
        policy_tenure: newEmi.policy_tenure,
        emi_tenure: newEmi.emi_tenure,
        monthly_emi_amount: newEmi.monthly_emi_amount === '' ? null : newEmi.monthly_emi_amount,
      });

      await loadClient();
      setNewEmi(emptyEmiForm);
      setShowAddEmi(false);
    } catch {
      alert('Failed to add EMI');
    } finally {
      setAddEmiLoading(false);
    }
  };

  const startEditEmi = (emi: any) => {
    setEditingEmiId(emi.id);
    setEditEmi({
      emi_provider: emi.emi_provider || '',
      down_payment: emi.down_payment?.toString?.() || '',
      emi_amount: emi.emi_amount?.toString?.() || '',
      policy_tenure: emi.policy_tenure || '',
      emi_tenure: emi.emi_tenure || '',
      monthly_emi_amount: emi.monthly_emi_amount?.toString?.() || '',
    });
  };

  const cancelEditEmi = () => {
    setEditingEmiId(null);
    setEditEmi(emptyEmiForm);
  };

  const handleSaveEmiEdit = async () => {
    if (!editingEmiId) return;

    try {
      setSavingEmiId(editingEmiId);

      await updateEmiDetails(editingEmiId, {
        emi_provider: editEmi.emi_provider,
        down_payment: editEmi.down_payment === '' ? null : editEmi.down_payment,
        emi_amount: editEmi.emi_amount === '' ? null : editEmi.emi_amount,
        policy_tenure: editEmi.policy_tenure,
        emi_tenure: editEmi.emi_tenure,
        monthly_emi_amount: editEmi.monthly_emi_amount === '' ? null : editEmi.monthly_emi_amount,
      });

      await loadClient();
      cancelEditEmi();
    } catch {
      alert('Failed to update EMI');
    } finally {
      setSavingEmiId(null);
    }
  };

  const handleDeleteEmi = async (id: number) => {
    const ok = confirm('Delete this EMI entry?');
    if (!ok) return;

    try {
      setDeletingEmiId(id);
      await deleteEmiDetails(id);
      await loadClient();
    } catch {
      alert('Failed to delete EMI');
    } finally {
      setDeletingEmiId(null);
    }
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <QuotesSection clientId={client.id} quotes={client.quotes} />
        </motion.div>

        {/* EMI SECTION — supports multiple entries */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                <WalletIcon />
              </span>
              <h2 className="text-[15px] font-medium text-[#F4F6FA]">
                EMI Details
                {emiList.length > 0 && (
                  <span className="ml-2 font-mono text-[11px] text-[#7C879E]">({emiList.length})</span>
                )}
              </h2>
            </div>

            {!showAddEmi && (
              <button
                onClick={() => setShowAddEmi(true)}
                className="flex items-center gap-1.5 bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 font-medium px-4 py-2 rounded-lg text-[13px] transition-colors"
              >
                <PlusIcon /> Add EMI
              </button>
            )}
          </div>

          {/* Existing EMI entries */}
          {emiList.length === 0 && !showAddEmi ? (
            <p className="text-[#7C879E] text-sm">No EMI details added for this client.</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {emiList.map((emi: any) => {
                  const isEditing = editingEmiId === emi.id;

                  return (
                    <motion.div
                      key={emi.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-4"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-[#7C879E]">EMI Provider</label>
                              <input
                                type="text"
                                value={editEmi.emi_provider}
                                onChange={(e) => setEditEmi({ ...editEmi, emi_provider: e.target.value })}
                                placeholder="Eg: Bajaj Finserv"
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-[#7C879E]">Down Payment</label>
                              <input
                                type="number"
                                value={editEmi.down_payment}
                                onChange={(e) => setEditEmi({ ...editEmi, down_payment: e.target.value })}
                                placeholder="Enter down payment"
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-[#7C879E]">EMI Amount</label>
                              <input
                                type="number"
                                value={editEmi.emi_amount}
                                onChange={(e) => setEditEmi({ ...editEmi, emi_amount: e.target.value })}
                                placeholder="Enter total EMI amount"
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-[#7C879E]">Policy Tenure</label>
                              <input
                                type="text"
                                value={editEmi.policy_tenure}
                                onChange={(e) => setEditEmi({ ...editEmi, policy_tenure: e.target.value })}
                                placeholder="Enter policy tenure"
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-[#7C879E]">EMI Tenure</label>
                              <input
                                type="text"
                                value={editEmi.emi_tenure}
                                onChange={(e) => setEditEmi({ ...editEmi, emi_tenure: e.target.value })}
                                placeholder="Enter EMI tenure"
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[11px] font-medium text-[#7C879E]">Monthly EMI Amount</label>
                              <input
                                type="number"
                                value={editEmi.monthly_emi_amount}
                                onChange={(e) => setEditEmi({ ...editEmi, monthly_emi_amount: e.target.value })}
                                placeholder="Enter monthly EMI amount"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              onClick={handleSaveEmiEdit}
                              disabled={savingEmiId === emi.id}
                              className="bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                            >
                              {savingEmiId === emi.id ? 'Saving...' : 'Save'}
                            </button>

                            <button
                              onClick={cancelEditEmi}
                              className="bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#5B8DEF]">
                                <TagIcon />
                              </span>
                              <p className="font-medium text-[14px] text-[#F4F6FA]">
                                {emi.emi_provider?.trim() ? emi.emi_provider : 'Unnamed Provider'}
                              </p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => startEditEmi(emi)}
                                className="flex items-center gap-1.5 bg-[#E3A857]/10 hover:bg-[#E3A857]/20 text-[#E3A857] border border-[#E3A857]/30 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                              >
                                <PencilIcon /> Edit
                              </button>

                              <button
                                onClick={() => handleDeleteEmi(emi.id)}
                                disabled={deletingEmiId === emi.id}
                                className="flex items-center gap-1.5 bg-[#EF6461]/10 hover:bg-[#EF6461]/20 text-[#EF6461] border border-[#EF6461]/30 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                              >
                                <TrashIcon /> {deletingEmiId === emi.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-sm">
                            <div>
                              <p className="text-[#565F76] text-[11px] mb-0.5">Down Payment</p>
                              <p className="text-[#F4F6FA] font-mono text-[13px]">{emi.down_payment ?? '-'}</p>
                            </div>
                            <div>
                              <p className="text-[#565F76] text-[11px] mb-0.5">EMI Amount</p>
                              <p className="text-[#F4F6FA] font-mono text-[13px]">{emi.emi_amount ?? '-'}</p>
                            </div>
                            <div>
                              <p className="text-[#565F76] text-[11px] mb-0.5">Policy Tenure</p>
                              <p className="text-[#F4F6FA] font-mono text-[13px]">{emi.policy_tenure || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[#565F76] text-[11px] mb-0.5">EMI Tenure</p>
                              <p className="text-[#F4F6FA] font-mono text-[13px]">{emi.emi_tenure || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[#565F76] text-[11px] mb-0.5">Monthly Amount</p>
                              <p className="text-[#F4F6FA] font-mono text-[13px]">{emi.monthly_emi_amount ?? '-'}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Add new EMI form */}
          <AnimatePresence>
            {showAddEmi && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#7C879E]">EMI Provider</label>
                      <input
                        type="text"
                        value={newEmi.emi_provider}
                        onChange={(e) => setNewEmi({ ...newEmi, emi_provider: e.target.value })}
                        placeholder="Eg: Bajaj Finserv"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#7C879E]">Down Payment</label>
                      <input
                        type="number"
                        value={newEmi.down_payment}
                        onChange={(e) => setNewEmi({ ...newEmi, down_payment: e.target.value })}
                        placeholder="Enter down payment"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#7C879E]">EMI Amount</label>
                      <input
                        type="number"
                        value={newEmi.emi_amount}
                        onChange={(e) => setNewEmi({ ...newEmi, emi_amount: e.target.value })}
                        placeholder="Enter total EMI amount"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#7C879E]">Policy Tenure</label>
                      <input
                        type="text"
                        value={newEmi.policy_tenure}
                        onChange={(e) => setNewEmi({ ...newEmi, policy_tenure: e.target.value })}
                        placeholder="Enter policy tenure"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#7C879E]">EMI Tenure</label>
                      <input
                        type="text"
                        value={newEmi.emi_tenure}
                        onChange={(e) => setNewEmi({ ...newEmi, emi_tenure: e.target.value })}
                        placeholder="Enter EMI tenure"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[12px] font-medium text-[#7C879E]">Monthly EMI Amount</label>
                      <input
                        type="number"
                        value={newEmi.monthly_emi_amount}
                        onChange={(e) => setNewEmi({ ...newEmi, monthly_emi_amount: e.target.value })}
                        placeholder="Enter monthly EMI amount"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={handleAddEmi}
                      disabled={addEmiLoading}
                      className="bg-[#5B8DEF] hover:bg-[#4a7ce0] disabled:opacity-50 transition-colors text-white px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      {addEmiLoading ? 'Saving...' : 'Save EMI'}
                    </button>

                    <button
                      onClick={() => {
                        setShowAddEmi(false);
                        setNewEmi(emptyEmiForm);
                      }}
                      disabled={addEmiLoading}
                      className="bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 transition-colors text-[#7C879E] px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {conversions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34D399]/[0.12] text-[#34D399]">
                <HeartIcon />
              </span>
              <h2 className="text-[15px] font-medium text-[#F4F6FA]">Converted Lead Details</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13px] text-[#EDEFF3]">
                <thead>
                  <tr className="bg-white/[0.03] text-[#7C879E] font-mono text-[11px] uppercase tracking-wide">
                    <th className="p-3 text-left font-medium">POSP</th>
                    <th className="p-3 text-left font-medium">Customer</th>
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Premium</th>
                    <th className="p-3 text-left font-medium">Policy</th>
                    <th className="p-3 text-left font-medium">Mobile</th>
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
                      <td className="p-3">{c.customer_name}</td>
                      <td className="p-3">{c.company_name}</td>
                      <td className="p-3 font-mono">₹{c.premium_amount}</td>
                      <td className="p-3">{c.policy_number}</td>
                      <td className="p-3 text-[#7C879E]">{c.customer_mobile}</td>
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
          transition={{ delay: 0.2 }}
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
              className={`${inputClass} resize-none`}
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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