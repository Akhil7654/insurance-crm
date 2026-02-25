'use client';

import { useState } from 'react';
import { createQuote, updateQuote, deleteQuote } from '@/lib/api';

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
    <div className="bg-gray-900 p-4 rounded-xl shadow mt-4 border border-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-white">🧾 Quotes</h3>

      {quotes?.length === 0 && (
        <p className="text-sm text-white mb-3">No quotes added yet</p>
      )}

      {/* LIST */}
      {quotes?.map((q) => {
        const isEditing = editingId === q.id;

        return (
          <div
            key={q.id}
            className="border-b border-gray-700 py-3 text-sm text-white"
          >
            {!isEditing ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{q.company_name}</p>
                  <p className="text-gray-300">₹{q.premium_amount}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(q)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500 text-black font-semibold cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(q.id)}
                    disabled={deletingId === q.id}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {deletingId === q.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 p-2 rounded text-white"
                  placeholder="Company Name"
                />

                <input
                  value={editPremium}
                  onChange={(e) => setEditPremium(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 p-2 rounded text-white"
                  placeholder="Premium Amount"
                  type="number"
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={loadingSave}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {loadingSave ? 'Saving…' : 'Save'}
                  </button>

                  <button
                    onClick={cancelEdit}
                    className="px-3 py-2 rounded-lg bg-gray-700 text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ADD */}
      <div className="mt-4 space-y-2">
        <input
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 p-2 rounded text-white"
        />

        <input
          placeholder="Premium Amount"
          type="number"
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 p-2 rounded text-white"
        />

        <button
          onClick={addQuote}
          disabled={loadingAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded transition cursor-pointer"
        >
          {loadingAdd ? 'Adding...' : '+ Add Quote'}
        </button>
      </div>
    </div>
  );
}