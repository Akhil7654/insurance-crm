'use client';

import { useState } from 'react';
import { createQuote } from '@/lib/api';

export default function QuotesSection({
  clientId,
  quotes,
}: {
  clientId: number;
  quotes: any[];
}) {
  const [company, setCompany] = useState('');
  const [premium, setPremium] = useState('');
  const [loading, setLoading] = useState(false);

  const addQuote = async () => {
    if (!company || !premium || loading) return;

    try {
      setLoading(true);

      await createQuote({
        client: clientId,
        company_name: company,
        premium_amount: premium,
      });

      // Clear inputs
      setCompany('');
      setPremium('');

      // For now reload (later we can improve this)
      location.reload();
    } catch {
      alert('Failed to add quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow mt-4 border border-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-white">🧾 Quotes</h3>

      {quotes?.length === 0 && (
        <p className="text-sm text-white mb-3">
          No quotes added yet
        </p>
      )}

      {quotes?.map((q) => (
        <div
          key={q.id}
          className="flex justify-between border-b border-gray-700 py-2 text-sm text-white"
        >
          <span>{q.company_name}</span>
          <span className="font-semibold">
            ₹{q.premium_amount}
          </span>
        </div>
      ))}

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
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded transition cursor-pointer"
        >
          {loading ? 'Adding...' : '+ Add Quote'}
        </button>
      </div>
    </div>
  );
}