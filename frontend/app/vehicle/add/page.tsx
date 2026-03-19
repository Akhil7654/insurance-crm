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
    // ✅ prevent double click / duplicate
    if (loading || clientId) return;

    // ✅ BASIC VALIDATION (important)
    if (!form.name || !form.mobile || !form.vehicle_type) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      // ✅ Create Client
      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'vehicle',
      });

      // ✅ Create Vehicle Insurance
      await createVehicleInsurance({
        client: client.id,
        vehicle_type: form.vehicle_type,
        insurance_cover: form.insurance_cover,
        renewal_date: form.renewal_date || null,
      });

      setClientId(client.id);

      alert('Vehicle client created ✅ Now add follow-up note');

    } catch (err) {
      alert('Error saving data');
      console.log(err);
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

      alert('Note added successfully ✅');

      // ✅ redirect after note
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

          <input
            name="name"
            placeholder="Client Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="mobile"
            placeholder="Phone Number"
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

          <input
            name="vehicle_type"
            placeholder="Vehicle Type (Car / Bike)"
            value={form.vehicle_type}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <select
            name="insurance_cover"
            value={form.insurance_cover}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          >
            <option value="full">Full Insurance</option>
            <option value="third_party">Third Party</option>
          </select>

          <input
            type="date"
            name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* ✅ SAVE BUTTON FIX */}
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

          {/* ✅ NOTE SECTION */}
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

              {/* ✅ REMINDER FIX */}
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
                disabled={noteLoading}
                className={`w-full py-2 rounded ${
                  noteLoading
                    ? 'bg-gray-400'
                    : 'bg-green-600 text-white'
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