'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, createHealthInsurance, createNote } from '@/lib/api';

export default function AddHealthClientPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    floater_type: 'individual',
    agesText: '',
    ped: '',
    renewal_date: '',
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
    return agesText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => !Number.isNaN(n) && n > 0);
  };

  const handleSubmit = async () => {
    if (loading) return; // ✅ FIX 1

    try {
      setLoading(true);

      const agesArray = parseAges(form.agesText);

      if (form.floater_type === 'individual' && agesArray.length !== 1) {
        alert('For Individual, enter exactly 1 age (example: 28)');
        return;
      }

      if (form.floater_type === 'family' && agesArray.length < 2) {
        alert('For Family, enter 2 or more ages (example: 30,28,5)');
        return;
      }

      // ✅ Create Client
      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'health',
      });

      const ages = agesArray.join(',');

      // ✅ Create Health Insurance
      await createHealthInsurance({
        client: client.id,
        floater_type: form.floater_type,
        ages,
        ped: form.ped,
        renewal_date: form.renewal_date || null,
      });

      setClientId(client.id);
      alert('Health client created successfully! Now you can add a note.');

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

      alert('Note added successfully ✅');

      // ✅ FIX 3: Redirect AFTER note
      router.push('/health');

    } catch {
      alert('Failed to add note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-indigo-950 p-6 rounded-xl shadow">
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
            <option value="individual">Individual</option>
            <option value="family">Family</option>
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

          <input
            type="date"
            name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <textarea
            name="ped"
            placeholder="PED details..."
            value={form.ped}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white'
            }`}
          >
            {loading ? 'Saving...' : 'Save Client'}
          </button>

          {clientId && (
            <div className="mt-6 border-t pt-4">
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

              <button
                onClick={handleAddNote}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                + Add Note & Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}