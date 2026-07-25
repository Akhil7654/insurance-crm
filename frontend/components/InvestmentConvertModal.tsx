'use client';

import { useState } from 'react';
import { convertInvestmentClient } from '@/lib/api';

export default function InvestmentConvertModal({ clientId, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    posp_code: '',
    company_name: '',
    investment_amount: '',
    policy_name: '',
    investment_paying_term: '',
    renewal_date: '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      await convertInvestmentClient(clientId, {
        ...form,
        investment_amount: Number(form.investment_amount || 0),
        renewal_date: form.renewal_date || null,
      });

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      alert('Convert failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    posp_code: 'POSP Code',
    company_name: 'Company Name',
    investment_amount: 'Investment Amount',
    policy_name: 'Policy Name',
    investment_paying_term: 'Investment Paying Term',
    renewal_date: 'Renewal Date',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Convert Investment Lead</h2>
          <p className="text-xs text-gray-500 mt-1">Enter details and save</p>
        </div>

        <div className="p-5 space-y-3">
          {Object.keys(form).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {fieldLabels[key]}
              </label>

              <input
                name={key}
                type={
                  key === 'renewal_date'
                    ? 'date'
                    : key === 'investment_amount'
                    ? 'number'
                    : 'text'
                }
                placeholder={`Enter ${fieldLabels[key]}`}
                value={(form as any)[key]}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}