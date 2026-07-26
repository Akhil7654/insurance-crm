'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getHealthClients,
  deleteClient,
  getHealthRenewalSummary,
  renewHealthClient,
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import ConvertModal from '@/components/ConvertModal';
import { motion, AnimatePresence } from 'framer-motion';

function toYYYYMM(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 20.5S4 15.8 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    <path d="M9.5 10h1.4l1-2 1.2 4 1-2h1.4" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .5 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .5 3 1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
);

/* ------------------------------------------------------- */
/* SKELETONS */
/* ------------------------------------------------------- */

function ClientsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#0F1420] border border-white/[0.06] p-5 rounded-2xl animate-pulse">
          <div className="h-4 w-40 bg-white/[0.06] rounded mb-3" />
          <div className="h-3 w-56 bg-white/[0.06] rounded mb-2" />
          <div className="h-3 w-32 bg-white/[0.06] rounded" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-20 bg-white/[0.06] rounded-lg" />
            <div className="h-8 w-20 bg-white/[0.06] rounded-lg" />
            <div className="h-8 w-20 bg-white/[0.06] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {[0, 1].map((i) => (
        <div key={i} className="bg-[#0A0E16] border border-white/[0.06] rounded-xl p-4 animate-pulse">
          <div className="h-3 w-28 bg-white/[0.06] rounded mb-3" />
          <div className="h-7 w-12 bg-white/[0.06] rounded" />
        </div>
      ))}
    </div>
  );
}

export default function HealthClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const [month, setMonth] = useState<string>(() => toYYYYMM(new Date()));
  const [summary, setSummary] = useState<{ pending: number; missed: number } | null>(null);

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorClients, setErrorClients] = useState<string | null>(null);

  const [loadingRenew, setLoadingRenew] = useState<number | null>(null);

  const loadClients = async () => {
    try {
      setErrorClients(null);
      setLoadingClients(true);
      const data = await getHealthClients();
      setClients(data);
    } catch {
      setErrorClients('Failed to load health clients');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      const s = await getHealthRenewalSummary(month);
      setSummary(s);
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line
  }, [month]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((client: any) =>
      String(client.name || '').toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleDelete = async (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation();
    const ok = confirm('Delete this client? This removes all data.');
    if (!ok) return;

    try {
      await deleteClient(clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      await loadSummary();
    } catch {
      alert('Delete failed');
    }
  };

  const openRenewalList = (status: 'pending' | 'missed') => {
    router.push(`/health/renewals?month=${month}&status=${status}`);
  };

  const handleSetRenewal = async (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation();
    const next = prompt('Enter Renewal Date (YYYY-MM-DD)');
    if (!next) return;

    try {
      setLoadingRenew(clientId);
      await renewHealthClient(clientId, next);
      await loadClients();
      await loadSummary();
      alert('Renewal date saved ✅');
    } catch {
      alert('Failed to set renewal date');
    } finally {
      setLoadingRenew(null);
    }
  };

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
        className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[#5B8DEF]/[0.08] blur-[120px]"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto w-full max-w-2xl px-6 py-14 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#5B8DEF] uppercase mb-3">
              HL · Health
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Health Insurance Clients</h1>
          </div>

          <button
            onClick={() => router.push('/health/add')}
            className="flex items-center gap-1.5 bg-[#5B8DEF] hover:bg-[#4a7ce0] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <PlusIcon /> Add Client
          </button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-6">
          <div className="flex items-center gap-2.5 bg-[#0F1420] border border-white/[0.06] focus-within:border-[#5B8DEF]/50 rounded-xl px-4 py-3 transition-colors">
            <span className="text-[#565F76]">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client by name..."
              className="w-full bg-transparent outline-none text-[#F4F6FA] placeholder:text-[#565F76] text-sm"
            />
          </div>
        </motion.div>

        {/* Renewal Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0F1420] border border-white/[0.06] rounded-2xl p-5 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-[#F4F6FA] font-medium text-[15px]">Renewal Calendar</p>
              <p className="text-[#7C879E] text-[13px] mt-0.5">Pick a month to view renewals</p>
            </div>

            <div className="flex items-center gap-2 bg-[#0A0E16] border border-white/[0.06] rounded-lg px-3 py-2">
              <span className="text-[#565F76]">
                <CalendarIcon />
              </span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-[#F4F6FA] text-sm outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {loadingSummary ? (
            <SummarySkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => openRenewalList('pending')}
                className="bg-[#0A0E16] border border-white/[0.06] hover:border-[#E3A857]/40 rounded-xl p-4 text-left transition-colors"
              >
                <p className="text-[#E3A857] text-[13px] font-medium">Pending Renewals</p>
                <p className="text-[#F4F6FA] text-2xl font-mono font-semibold mt-1">{summary?.pending ?? 0}</p>
              </button>

              <button
                onClick={() => openRenewalList('missed')}
                className="bg-[#0A0E16] border border-white/[0.06] hover:border-[#EF6461]/40 rounded-xl p-4 text-left transition-colors"
              >
                <p className="text-[#EF6461] text-[13px] font-medium">Missed Renewals</p>
                <p className="text-[#F4F6FA] text-2xl font-mono font-semibold mt-1">{summary?.missed ?? 0}</p>
              </button>
            </div>
          )}
        </motion.div>

        {/* Client list */}
        <div className="space-y-3">
          {loadingClients ? (
            <ClientsSkeleton />
          ) : errorClients ? (
            <div className="text-center py-12">
              <p className="text-[#EF6461] font-medium text-sm">{errorClients}</p>
              <button
                onClick={loadClients}
                className="mt-4 bg-[#5B8DEF] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#4a7ce0] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[#7C879E] text-sm py-14">
              {search.trim() ? 'No matching health clients found.' : 'No health clients found.'}
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredClients.map((client: any, i) => {
                const renewalDate = client.health_details?.renewal_date;
                const needsRenewalDate = !renewalDate;

                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => router.push(`/health/client/${client.id}`)}
                    className="group relative rounded-2xl p-[1px] overflow-hidden cursor-pointer"
                  >
                    <div
                      className="absolute -inset-[40%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0%, #5B8DEF 12%, transparent 28%)',
                        animation: 'card-glow-spin 3.2s linear infinite',
                      }}
                    />

                    <div className="relative z-10 rounded-[15px] bg-[#0F1420] border border-white/[0.06] group-hover:border-white/[0.02] transition-colors p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
                              <HeartIcon />
                            </span>
                            <p className="font-medium text-[15px] text-[#F4F6FA] truncate">{client.name}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#7C879E] pl-[42px]">
                            <span className="flex items-center gap-1.5">
                              <PhoneIcon /> {client.mobile}
                            </span>
                            {client.place && (
                              <span className="flex items-center gap-1.5">
                                <PinIcon /> {client.place}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2.5 pl-[42px]">
                            {renewalDate ? (
                              <span className="text-[11px] font-medium text-[#E3A857] bg-[#E3A857]/10 border border-[#E3A857]/30 px-2 py-0.5 rounded-full">
                                Renewal: {renewalDate}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[#EF6461] bg-[#EF6461]/10 border border-[#EF6461]/30 px-2 py-0.5 rounded-full">
                                No renewal date set
                              </span>
                            )}

                            {client.is_converted && (
                              <span className="text-[11px] font-medium text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30 px-2 py-0.5 rounded-full">
                                Converted
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex flex-wrap gap-2 sm:shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {needsRenewalDate && (
                            <button
                              disabled={loadingRenew === client.id}
                              onClick={(e) => handleSetRenewal(e, client.id)}
                              className="flex items-center gap-1.5 bg-[#E3A857]/10 hover:bg-[#E3A857]/20 text-[#E3A857] border border-[#E3A857]/30 font-medium px-3 py-1.5 rounded-lg text-[12px] transition-colors disabled:opacity-50"
                            >
                              <CalendarIcon /> {loadingRenew === client.id ? 'Saving...' : 'Set Renewal'}
                            </button>
                          )}

                          {!client.is_converted && (
                            <button
                              onClick={() => setSelectedClient(client.id)}
                              className="bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 font-medium px-3 py-1.5 rounded-lg text-[12px] transition-colors"
                            >
                              Convert
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDelete(e, client.id)}
                            className="flex items-center gap-1.5 bg-[#EF6461]/10 hover:bg-[#EF6461]/20 text-[#EF6461] border border-[#EF6461]/30 font-medium px-3 py-1.5 rounded-lg text-[12px] transition-colors"
                          >
                            <TrashIcon /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {selectedClient && (
          <ConvertModal
            clientId={selectedClient}
            onClose={() => setSelectedClient(null)}
            onSuccess={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}