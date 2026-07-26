'use client';

import { useState } from 'react';
import { convertInvestmentClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="m20.6 12.6-8 8a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 12.8 3H19a1 1 0 0 1 1 1v6.2a2 2 0 0 1-.4 1.4Z" />
    <circle cx="15.5" cy="8.5" r="1.2" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
    <path d="M8 8h1.5M8 12h1.5M8 16h1.5M14.5 8H16M14.5 12H16M14.5 16H16" />
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" />
    <path d="M4 18h16" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

const fieldMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  posp_code: { label: 'POSP Code', icon: <TagIcon /> },
  company_name: { label: 'Company Name', icon: <BuildingIcon /> },
  investment_amount: { label: 'Investment Amount', icon: <TrendingIcon /> },
  policy_name: { label: 'Policy Name', icon: <FileIcon /> },
  investment_paying_term: { label: 'Investment Paying Term', icon: <ClockIcon /> },
  renewal_date: { label: 'Renewal Date', icon: <CalendarIcon /> },
};

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-2xl p-[1px] overflow-hidden"
        >
          <div
            className="absolute -inset-[40%] opacity-60 pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, #E3A857 12%, transparent 28%)',
              animation: 'card-glow-spin 4s linear infinite',
            }}
          />
          <style>{`@keyframes card-glow-spin { to { transform: rotate(360deg); } }`}</style>

          <div className="relative z-10 bg-[#0F1420] rounded-[15px] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3A857]/[0.12] text-[#E3A857]">
                  <TrendingIcon />
                </span>
                <div>
                  <h2 className="text-[15px] font-medium text-[#F4F6FA]">Convert Investment Lead</h2>
                  <p className="text-[12px] text-[#7C879E] mt-0.5">Enter details and save</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
              {Object.keys(form).map((key) => {
                const meta = fieldMeta[key];
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[12px] font-medium text-[#E3A857]">
                      {meta.icon}
                      {meta.label}
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
                      placeholder={`Enter ${meta.label.toLowerCase()}`}
                      value={(form as any)[key]}
                      onChange={handleChange}
                      className="w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#E3A857]/50 text-[#F4F6FA] placeholder:text-[#E3A857]/40 text-sm p-3 rounded-xl outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex gap-2.5 justify-end">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] text-sm font-medium transition-colors disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-[#E3A857] hover:bg-[#d1963f] text-[#05070C] text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}