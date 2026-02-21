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

  const addQuote = async () => {
    if (!company || !premium) return;

    await createQuote({
      client: clientId,
      company_name: company,
      premium_amount: premium,
    });

    // 🔥 Better than reload later — for now ok
    location.reload();
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow mt-4 border-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-white">🧾 Quotes</h3>

      {quotes?.length === 0 && (
        <p className="text-sm text-white mb-3">
          No quotes added yet
        </p>
      )}

      {quotes?.map((q) => (
        <div
          key={q.id}
          className="flex justify-between border-b py-2 text-sm"
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
          className="w-full border p-2 rounded text-white"
        />

        <input
          placeholder="Premium Amount"
          type="number"
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
          className="w-full border p-2 rounded text-white"
        />

        <button
          onClick={addQuote}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          + Add Quote
        </button>
      </div>
    </div>
  );
}
