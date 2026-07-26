'use client';

import { useState } from 'react';
import { createQuote, updateQuote, deleteQuote } from '@/lib/api';

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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

export default function QuotesSection({
  clientId,
  quotes,
}: {
  clientId: number;
  quotes: any[];
}) {
  const [company, setCompany] = useState('');
  const [premium, setPremium] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editPremium, setEditPremium] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const addQuote = async () => {
    if (!company || !premium || loadingAdd) return;

    try {
      setLoadingAdd(true);

      await createQuote({
        client: clientId,
        company_name: company,
        premium_amount: Number(premium),
      });

      setCompany('');
      setPremium('');

      location.reload();
    } catch {
      alert('Failed to add quote');
    } finally {
      setLoadingAdd(false);
    }
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditCompany(q.company_name || '');
    setEditPremium(String(q.premium_amount ?? ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCompany('');
    setEditPremium('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editCompany || !editPremium) return;

    try {
      setLoadingSave(true);

      await updateQuote(editingId, {
        company_name: editCompany,
        premium_amount: Number(editPremium),
      });

      cancelEdit();
      location.reload();
    } catch {
      alert('Failed to update quote');
    } finally {
      setLoadingSave(false);
    }
  };

  const onDelete = async (id: number) => {
    const ok = confirm('Delete this quote?');
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteQuote(id);
      location.reload();
    } catch {
      alert('Failed to delete quote');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
          <TagIcon />
        </span>
        <h3 className="text-[15px] font-medium text-[#F4F6FA]">Quotes</h3>
      </div>

      {quotes?.length === 0 && (
        <p className="text-[13px] text-[#7C879E] mb-3">No quotes added yet</p>
      )}

      {/* LIST */}
      {quotes && quotes.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {quotes.map((q) => {
            const isEditing = editingId === q.id;

            return (
              <div key={q.id} className="bg-[#0A0E16] border border-white/[0.08] rounded-xl p-4">
                {!isEditing ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[14px] text-[#F4F6FA] truncate">{q.company_name}</p>
                      <p className="text-[#7C879E] text-[13px] font-mono">₹{q.premium_amount}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(q)}
                        className="flex items-center gap-1.5 bg-[#E3A857]/10 hover:bg-[#E3A857]/20 text-[#E3A857] border border-[#E3A857]/30 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                      >
                        <PencilIcon /> Edit
                      </button>

                      <button
                        onClick={() => onDelete(q.id)}
                        disabled={deletingId === q.id}
                        className="flex items-center gap-1.5 bg-[#EF6461]/10 hover:bg-[#EF6461]/20 text-[#EF6461] border border-[#EF6461]/30 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-60"
                      >
                        <TrashIcon /> {deletingId === q.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className={inputClass}
                      placeholder="Company Name"
                    />

                    <input
                      value={editPremium}
                      onChange={(e) => setEditPremium(e.target.value)}
                      className={inputClass}
                      placeholder="Premium Amount"
                      type="number"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={loadingSave}
                        className="bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-60"
                      >
                        {loadingSave ? 'Saving…' : 'Save'}
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD */}
      <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
        <input
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="Premium Amount"
          type="number"
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
          className={inputClass}
        />

        <button
          onClick={addQuote}
          disabled={loadingAdd}
          className="w-full bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {loadingAdd ? 'Adding...' : 'Add Quote'}
        </button>
      </div>
    </div>
  );
}