'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const modules = [
  {
    index: '01',
    label: 'Vehicle Insurance',
    description: 'Motor policies, quotes & renewals',
    href: '/vehicle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 16h16v-3.2a1 1 0 0 0-.6-.92L17 10l-1.6-3.6A2 2 0 0 0 13.6 5H10.4a2 2 0 0 0-1.8 1.4L7 10l-2.4 1.88a1 1 0 0 0-.6.92V16Z" strokeLinejoin="round" />
        <circle cx="7.5" cy="16" r="1.75" />
        <circle cx="16.5" cy="16" r="1.75" />
        <path d="M4 12.5h16" />
      </svg>
    ),
  },
  {
    index: '02',
    label: 'Health Insurance',
    description: 'Individual & family floater plans',
    href: '/health',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" strokeLinejoin="round" />
        <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    index: '03',
    label: 'Investment',
    description: 'SIPs, ULIPs & investment leads',
    href: '/investment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 18V9.5M9.5 18V6M15 18v-5M20 18V4" strokeLinecap="round" />
        <path d="M4 18h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    index: '04',
    label: 'Reminder Dashboard',
    description: 'Follow-ups & renewal alerts',
    href: '/reminders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 12.5 6 8.5Z" strokeLinejoin="round" />
        <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F2F3F5] text-[#12192B] px-6 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#A9782F] uppercase mb-3">
            Insurance CRM
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#12192B]">
            Client Ledger
          </h1>
          <p className="text-[#4B5565] mt-2 text-[15px]">
            Select a book of business to view clients, quotes and renewals.
          </p>
        </motion.div>

        {/* Ledger rows */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
          }}
          className="border-t border-[#E1E4E9] bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(18,25,43,0.04)]"
        >
          {modules.map((mod, i) => (
            <motion.button
              key={mod.href}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
              }}
              onClick={() => router.push(mod.href)}
              className={`group w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left transition-colors hover:bg-[#F8F9FA] ${
                i !== modules.length - 1 ? 'border-b border-[#E1E4E9]' : ''
              }`}
            >
              <span className="font-mono text-xs text-[#A9782F] w-6 shrink-0">
                {mod.index}
              </span>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF1F6] text-[#1E3A66]">
                <span className="h-[18px] w-[18px]">{mod.icon}</span>
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-medium text-[#12192B]">
                  {mod.label}
                </span>
                <span className="block text-[13px] text-[#4B5565] mt-0.5 truncate">
                  {mod.description}
                </span>
              </span>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 shrink-0 text-[#9AA3B2] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1E3A66]"
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[#9AA3B2] text-xs mt-10 font-mono">
          © {new Date().getFullYear()} INSURANCE CRM
        </p>
      </div>
    </div>
  );
}