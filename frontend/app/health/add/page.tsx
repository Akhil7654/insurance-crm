'use client';

import { useState } from 'react';
import { createClient, createHealthInsurance, createNote } from '@/lib/api';

export default function AddHealthClientPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    floater_type: 'individual',
    agesText: '', // "28" OR "30,28,5"
    ped: '',
    renewal_date: '', // ✅ new field
  });

  const [clientId, setClientId] = useState<number | null>(null);

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseAges = (agesText: string) => {
    // "24" OR "24,30,5"
    return agesText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => !Number.isNaN(n) && n > 0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // ✅ 1) Create Client
      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'health',
      });

      // ✅ 2) Validate Ages
      const agesArray = parseAges(form.agesText);

      if (form.floater_type === 'individual' && agesArray.length !== 1) {
        alert('For Individual, enter exactly 1 age (example: 28)');
        return;
      }

      if (form.floater_type === 'family' && agesArray.length < 2) {
        alert('For Family, enter 2 or more ages (example: 30,28,5)');
        return;
      }

      // ✅ 3) SQLite-safe: send ages as string "30,28,5"
      const ages = agesArray.join(',');

      // ✅ 4) Create HealthInsurance (with renewal_date)
      await createHealthInsurance({
        client: client.id,
        floater_type: form.floater_type,
        ages,
        ped: form.ped,
        renewal_date: form.renewal_date || null, // ✅ send renewal date
      });

      setClientId(client.id);
      alert('Health client created successfully!');
    } catch (err) {
      alert('Error saving data');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!clientId) return;

    try {
      await createNote({
        client: clientId,
        text: note.text,
        follow_up_date: note.follow_up_date,
        reminder: note.reminder,
      });

      alert('Note added');
      setNote({ text: '', follow_up_date: '', reminder: true });
    } catch {
      alert('Failed to add note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-black p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-white">
          Add Health Insurance Client
        </h2>

        <div className="space-y-4">
          <input
            name="name"
            placeholder="Client Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="place"
            placeholder="Place"
            value={form.place}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <select
            name="floater_type"
            value={form.floater_type}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          >
            <option className="text-black" value="individual">
              Individual
            </option>
            <option className="text-black" value="family">
              Family
            </option>
          </select>

          <input
            name="agesText"
            placeholder={
              form.floater_type === 'individual'
                ? 'Age (example: 28)'
                : 'Ages (example: 30,28,5)'
            }
            value={form.agesText}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* ✅ New Renewal Date field */}
          <label htmlFor="renewal_date" className="block text-sm font-bold font-sans text-white mb-1">
            Renewal Date
          </label>
          <input
            type="date"
            name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="Renewal Date"
          />

          <textarea
            name="ped"
            placeholder="PED (Pre-existing Disease) details..."
            value={form.ped}
            onChange={handleChange}
            className="w-full border p-3 rounded min-h-120px"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? 'Saving...' : 'Save Client'}
          </button>

          {clientId && (
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-2 text-white">
                Add Follow-up Note
              </h3>

              <textarea
                placeholder="Note details..."
                value={note.text}
                onChange={(e) => setNote({ ...note, text: e.target.value })}
                className="w-full border p-3 rounded mb-3"
              />

              <input
                type="date"
                value={note.follow_up_date}
                onChange={(e) =>
                  setNote({ ...note, follow_up_date: e.target.value })
                }
                className="w-full border p-3 rounded mb-3"
              />

              <label className="flex items-center gap-2 mb-3 text-white">
                <input
                  type="checkbox"
                  checked={note.reminder}
                  onChange={(e) =>
                    setNote({ ...note, reminder: e.target.checked })
                  }
                />
                Reminder
              </label>

              <button
                onClick={handleAddNote}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                + Add Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}