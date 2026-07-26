'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="m20.6 12.6-8 8a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 12.8 3H19a1 1 0 0 1 1 1v6.2a2 2 0 0 1-.4 1.4Z" />
    <circle cx="15.5" cy="8.5" r="1.2" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
    <path d="M8 8h1.5M8 12h1.5M8 16h1.5M14.5 8H16M14.5 12H16M14.5 16H16" />
  </svg>
);

const RupeeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M7 4h10M7 8h10M7 4v0a5 5 0 0 1 0 8h-1l6 8" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .5 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .5 3 1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const fieldMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  posp_code: { label: 'POSP Code', icon: <TagIcon /> },
  customer_name: { label: 'Customer Name', icon: <UserIcon /> },
  company_name: { label: 'Company Name', icon: <BuildingIcon /> },
  premium_amount: { label: 'Premium Amount', icon: <RupeeIcon /> },
  policy_number: { label: 'Policy Number', icon: <FileIcon /> },
  customer_mobile: { label: 'Customer Mobile', icon: <PhoneIcon /> },
};

export default function ConvertModal({ clientId, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    posp_code: "",
    customer_name: "",
    company_name: "",
    premium_amount: "",
    policy_number: "",
    customer_mobile: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/convert-client/${clientId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          premium_amount: Number(form.premium_amount || 0),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Convert failed");
      }

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      alert("Convert failed: " + (err.message || "Unknown error"));
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
              background: 'conic-gradient(from 0deg, transparent 0%, #5B8DEF 12%, transparent 28%)',
              animation: 'card-glow-spin 4s linear infinite',
            }}
          />
          <style>{`@keyframes card-glow-spin { to { transform: rotate(360deg); } }`}</style>

          <div className="relative z-10 bg-[#0F1420] rounded-[15px] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                  <TagIcon />
                </span>
                <div>
                  <h2 className="text-[15px] font-medium text-[#F4F6FA]">Convert Lead</h2>
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
                    <label className="flex items-center gap-2 text-[12px] font-medium text-[#7C879E]">
                      {meta.icon}
                      {meta.label}
                    </label>

                    <input
                      name={key}
                      type={key === 'premium_amount' ? 'number' : 'text'}
                      placeholder={`Enter ${meta.label.toLowerCase()}`}
                      value={(form as any)[key]}
                      onChange={handleChange}
                      className="w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3 rounded-xl outline-none transition-colors"
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
                className="px-4 py-2.5 rounded-xl bg-[#5B8DEF] hover:bg-[#4a7ce0] text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}