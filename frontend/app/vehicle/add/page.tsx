'use client';

import { useState } from 'react';
import { createClient, createVehicleInsurance, createNote } from '@/lib/api';

export default function VehiclePage() {
  const [loading, setLoading] = useState(false);

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
      alert('Vehicle client created successfully!');
    } catch {
      alert('Error saving data');
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
      <div className="max-w-xl mx-auto bg-indigo-950 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-white">Add Vehicle Insurance Client</h2>

        <div className="space-y-4">
          <input name="name" placeholder="Client Name" value={form.name} onChange={handleChange} className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic" />
          <input name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic" />
          <input name="place" placeholder="Place" value={form.place} onChange={handleChange} className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic" />
          <input name="vehicle_type" placeholder="Vehicle Type (Car / Bike)" value={form.vehicle_type} onChange={handleChange} className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic" />

          <select name="insurance_cover" value={form.insurance_cover} onChange={handleChange} className="w-full border border-white p-3 rounded text-teal-400 font-semibold italic">
            <option className="text-black" value="full">Full Insurance</option>
            <option className="text-black" value="third_party">Third Party</option>
          </select>

          {/* ✅ Label added for renewal date */}
          <label htmlFor="renewal_date" className="block text-sm font-bold font-sans text-white mb-1">
            Renewal Date
          </label>
          <input
            type="date"
            id="renewal_date"
            name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            className="w-full border border-white p-3 rounded text-yellow-600 font-semibold"
          />

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
            {loading ? 'Saving...' : 'Save Client'}
          </button>

          {clientId && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 text-white">Add Follow-up Note</h3>

              <textarea
                placeholder="Note details..."
                value={note.text}
                onChange={(e) => setNote({ ...note, text: e.target.value })}
                className="w-full border p-3 rounded mb-3 placeholder:text-yellow-600 font-semibold italic"
              />

        
              <input
                type="date"
                id="follow_up_date"
                value={note.follow_up_date}
                onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                className="w-full border p-3 rounded mb-3 text-yellow-600 font-semibold"
              />

              <label className="flex items-center gap-2 mb-3 text-teal-400 font-semibold">
                <input
                  type="checkbox"
                  checked={note.reminder}
                  onChange={(e) => setNote({ ...note, reminder: e.target.checked })}
                />
                Reminder
              </label>

              <button onClick={handleAddNote} className="w-full bg-green-600 text-white py-2 rounded">
                + Add Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}