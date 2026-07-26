'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Note = {
  id: number;
  text: string;
  follow_up_date: string;
  reminder: boolean;
  priority?: 'HOT' | 'WARM' | 'COOL';
};

const priorityOptions = [
  { value: 'HOT', label: 'Hot', color: '#EF6461' },
  { value: 'WARM', label: 'Warm', color: '#E3A857' },
  { value: 'COOL', label: 'Cool', color: '#5B8DEF' },
] as const;

/* ------------------------------------------------------- */
/* ICONS */
/* ------------------------------------------------------- */

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9" />
    <path d="M3.5 5v4h4" />
    <path d="M12 8v4l3 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <path d="M6 8.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 12.5 6 8.5Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
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

const priorityMeta = (priority: string) =>
  priorityOptions.find((p) => p.value === priority) || priorityOptions[0];

const inputClass =
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] placeholder:text-[#565F76] text-sm p-3 rounded-xl outline-none transition-colors';

export default function HistoryTimeline({
  notes,
  onNoteUpdate,
  onNoteDelete,
}: {
  notes: Note[];
  onNoteUpdate: (
    note: Note,
    text: string,
    reminder: boolean,
    priority: 'HOT' | 'WARM' | 'COOL'
  ) => void;
  onNoteDelete: (note: Note) => void;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [reminder, setReminder] = useState(false);
  const [priority, setPriority] = useState<'HOT' | 'WARM' | 'COOL'>('HOT');
  const [showAll, setShowAll] = useState(false);

  const visibleNotes = showAll ? notes : notes.slice(0, 3);
  const hiddenCount = Math.max(notes.length - 3, 0);

  return (
    <div className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
            <HistoryIcon />
          </span>
          <h3 className="text-[15px] font-medium text-[#F4F6FA]">Client History</h3>
        </div>

        {notes.length > 3 && (
          <span className="font-mono text-[11px] text-[#7C879E] bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
            {visibleNotes.length} / {notes.length}
          </span>
        )}
      </div>

      {notes.length === 0 && <p className="text-[#7C879E] text-sm">No history found</p>}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {visibleNotes.map((note) => {
            const meta = priorityMeta(note.priority || 'HOT');

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="relative bg-[#0A0E16] border-l-2 rounded-xl p-4"
                  style={{ borderLeftColor: meta.color, borderTop: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {editId === note.id ? (
                    <>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        className={`${inputClass} mb-3 resize-none`}
                      />

                      <label className="flex items-center gap-3 bg-[#0F1420] border border-white/[0.08] rounded-xl px-3.5 py-3 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reminder}
                          onChange={(e) => setReminder(e.target.checked)}
                          className="w-4 h-4 accent-[#5B8DEF]"
                        />
                        <span className="flex items-center gap-2">
                          <span className="text-[#7C879E]">
                            <BellIcon />
                          </span>
                          <span className="text-[13px] font-medium text-[#F4F6FA]">Enable Reminder</span>
                        </span>
                      </label>

                      <div className="bg-[#0F1420] border border-white/[0.08] rounded-xl p-4 mb-3">
                        <p className="text-[13px] font-medium text-[#F4F6FA] mb-3">Lead Priority</p>

                        <div className="grid grid-cols-3 gap-2.5">
                          {priorityOptions.map((item) => {
                            const active = priority === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setPriority(item.value)}
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
                                    active ? 'bg-[#0A0E16] border-white/[0.02]' : 'bg-[#0A0E16] border-white/[0.08] hover:border-white/[0.16]'
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                                  <span className="text-[13px] font-medium" style={{ color: active ? item.color : '#7C879E' }}>
                                    {item.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => {
                            onNoteUpdate(note, text, reminder, priority);
                            setEditId(null);
                          }}
                          className="bg-[#5B8DEF] hover:bg-[#4a7ce0] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditId(null)}
                          className="bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-[11px] text-[#565F76] mb-1.5">{note.follow_up_date}</p>
                      <p className="font-medium text-[14px] text-[#F4F6FA]">{note.text}</p>

                      <div className="flex items-center gap-3 text-sm mt-3 flex-wrap">
                        <button
                          onClick={() => {
                            setEditId(note.id);
                            setText(note.text);
                            setReminder(!!note.reminder);
                            setPriority(note.priority || 'HOT');
                          }}
                          className="flex items-center gap-1.5 text-[#5B8DEF] hover:text-[#7ba3f5] text-[13px] font-medium transition-colors"
                        >
                          <PencilIcon /> Edit
                        </button>

                        <button
                          onClick={() => confirm('Delete note?') && onNoteDelete(note)}
                          className="flex items-center gap-1.5 text-[#EF6461] hover:text-[#f18178] text-[13px] font-medium transition-colors"
                        >
                          <TrashIcon /> Delete
                        </button>

                        <span
                          className="ml-auto flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border"
                          style={{
                            color: meta.color,
                            borderColor: `${meta.color}40`,
                            background: `${meta.color}14`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </span>

                        {note.reminder && (
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#E3A857] bg-[#E3A857]/10 border border-[#E3A857]/30 px-2.5 py-1 rounded-full">
                            <CalendarIcon /> Reminder
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {notes.length > 3 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => {
              setShowAll(!showAll);
              setEditId(null);
            }}
            className="bg-white/[0.04] hover:bg-white/[0.08] text-[#7C879E] px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors border border-white/[0.08]"
          >
            {showAll ? 'Show Less' : `Show More (${hiddenCount} more)`}
          </button>
        </div>
      )}
    </div>
  );
}