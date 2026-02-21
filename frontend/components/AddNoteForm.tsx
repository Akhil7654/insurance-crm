'use client';

import { useState } from 'react';
import { createNote } from '@/lib/api';

export default function AddNoteForm({
  clientId,
  onAdded,
}: {
  clientId: number;
  onAdded: () => void;
}) {
  const [text, setText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);

      await createNote({
        client: clientId,
        text,
        follow_up_date: followUpDate || null,
      });

      setText('');
      setFollowUpDate('');
      onAdded(); // refresh history
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3">
      <textarea
        placeholder="Add note / reminder..."
        className="w-full border rounded-lg p-3"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <input
          type="date"
          className="border rounded-lg p-2"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          {loading ? 'Saving...' : 'Add Note'}
        </button>
      </div>
    </form>
  );
}
