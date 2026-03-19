'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, createVehicleInsurance, createNote } from '@/lib/api';

export default function VehiclePage() {
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    vehicle_type: '',
    insurance_cover: 'full',
    renewal_date: '',
  });

  const [clientId, setClientId] = useState<number | null>(null);

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading || clientId) return;

    if (!form.name || !form.mobile || !form.vehicle_type) {
      alert('Fill required fields');
      return;
    }

    try {
      setLoading(true);

      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'vehicle',
      });

      await createVehicleInsurance({
        client: client.id,
        vehicle_type: form.vehicle_type,
        insurance_cover: form.insurance_cover,
        renewal_date: form.renewal_date || null,
      });

      setClientId(client.id);
      alert('Client created ✅ Now add note');

    } catch {
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!clientId || noteLoading) return;

    try {
      setNoteLoading(true);

      await createNote({
        client: clientId,
        text: note.text,
        follow_up_date: note.follow_up_date,
        reminder: note.reminder,
      });

      alert('Note added ✅');
      router.push('/vehicle');

    } catch {
      alert('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-indigo-950 p-6 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4 text-white">
          Add Vehicle Insurance Client
        </h2>

        <div className="space-y-4">

          <input name="name" placeholder="Client Name"
            value={form.name} onChange={handleChange}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans" />

          <input name="mobile" placeholder="Phone Number"
            value={form.mobile} onChange={handleChange}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans" />

          <input name="place" placeholder="Place"
            value={form.place} onChange={handleChange}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans" />

          <input name="vehicle_type" placeholder="Vehicle Type (Car / Bike)"
            value={form.vehicle_type} onChange={handleChange}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans" />

          <select name="insurance_cover"
            value={form.insurance_cover}
            onChange={handleChange}
            className="w-full border border-white p-3 rounded text-teal-400 font-semibold italic">

            <option className="text-black" value="full">Full Insurance</option>
            <option className="text-black" value="third_party">Third Party</option>
          </select>

          <label className="block text-sm font-bold text-white">
            Renewal Date
          </label>

          <input type="date" name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            className="w-full border border-white p-3 rounded text-yellow-600 font-semibold" />

          <button
            onClick={handleSubmit}
            disabled={loading || clientId !== null}
            className={`w-full py-3 rounded-xl font-semibold ${
              loading || clientId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white'
            }`}
          >
            {clientId ? 'Client Saved ✅' : loading ? 'Saving...' : 'Save Client'}
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
                className="w-full border p-3 rounded mb-3 placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans"
              />

              <input type="date"
                value={note.follow_up_date}
                onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                className="w-full border p-3 rounded mb-3 text-yellow-600 font-semibold" />

              <label className="flex items-center gap-2 mb-3 text-teal-400 font-semibold">
                <input type="checkbox"
                  checked={note.reminder}
                  onChange={(e) => setNote({ ...note, reminder: e.target.checked })}
                />
                Reminder
              </label>

              <button
                onClick={handleAddNote}
                disabled={noteLoading}
                className={`w-full py-2 rounded ${
                  noteLoading ? 'bg-gray-400' : 'bg-green-600 text-white'
                }`}
              >
                {noteLoading ? 'Saving...' : '+ Add Note & Finish'}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}