'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createClient,
  createVehicleInsurance,
  createNote,
  createQuote,
  updateQuote,
  deleteQuote,
} from '@/lib/api';

export default function VehiclePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [clientId, setClientId] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    vehicle_type: '',
    insurance_cover: 'full',
    renewal_date: '',
  });

  const [quote, setQuote] = useState({
    company_name: '',
    premium_amount: '',
  });

  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editQuote, setEditQuote] = useState({
    company_name: '',
    premium_amount: '',
  });

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
    priority: 'HOT',
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
      alert('Client created ✅ Now add quotes and follow-up');
    } catch {
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async () => {
    if (!clientId || quoteLoading) return;

    if (!quote.company_name || !quote.premium_amount) {
      alert('Enter company and premium amount');
      return;
    }

    try {
      setQuoteLoading(true);

      const newQuote = await createQuote({
        client: clientId,
        company_name: quote.company_name,
        premium_amount: Number(quote.premium_amount),
      });

      setQuotes((prev) => [newQuote, ...prev]);
      setQuote({ company_name: '', premium_amount: '' });
    } catch {
      alert('Failed to add quote');
    } finally {
      setQuoteLoading(false);
    }
  };

  const startEditQuote = (q: any) => {
    setEditingQuoteId(q.id);
    setEditQuote({
      company_name: q.company_name || '',
      premium_amount: String(q.premium_amount ?? ''),
    });
  };

  const cancelEditQuote = () => {
    setEditingQuoteId(null);
    setEditQuote({
      company_name: '',
      premium_amount: '',
    });
  };

  const handleSaveQuote = async () => {
    if (!editingQuoteId) return;

    if (!editQuote.company_name || !editQuote.premium_amount) {
      alert('Enter company and premium amount');
      return;
    }

    try {
      const updated = await updateQuote(editingQuoteId, {
        company_name: editQuote.company_name,
        premium_amount: Number(editQuote.premium_amount),
      });

      setQuotes((prev) =>
        prev.map((q) => (q.id === editingQuoteId ? updated : q))
      );

      cancelEditQuote();
    } catch {
      alert('Failed to update quote');
    }
  };

  const handleDeleteQuote = async (id: number) => {
    const ok = confirm('Delete this quote?');
    if (!ok) return;

    try {
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert('Failed to delete quote');
    }
  };

  const handleAddNote = async () => {
    if (!clientId || noteLoading) return;

    if (!note.text || !note.follow_up_date) {
      alert('Enter note and follow-up date');
      return;
    }

    try {
      setNoteLoading(true);

      await createNote({
        client: clientId,
        text: note.text,
        follow_up_date: note.follow_up_date,
        reminder: note.reminder,
        priority: note.priority,
      });

      alert('Client details completed ✅');
      router.push('/vehicle');
    } catch {
      alert('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  const finishWithoutNote = () => {
    router.push('/vehicle');
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
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <input
            name="mobile"
            placeholder="Phone Number"
            value={form.mobile}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <input
            name="place"
            placeholder="Place"
            value={form.place}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <input
            name="vehicle_type"
            placeholder="Vehicle Type (Car / Bike)"
            value={form.vehicle_type}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <select
            name="insurance_cover"
            value={form.insurance_cover}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border border-white p-3 rounded text-teal-400 font-semibold italic disabled:opacity-60"
          >
            <option className="text-black" value="full">
              Full Insurance
            </option>
            <option className="text-black" value="third_party">
              Third Party
            </option>
          </select>

          <label className="block text-sm font-bold text-white">
            Renewal Date
          </label>

          <input
            type="date"
            name="renewal_date"
            value={form.renewal_date}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border border-white p-3 rounded text-yellow-600 font-semibold disabled:opacity-60"
          />

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
            <>
              <div className="mt-6 border-t border-white/20 pt-5">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  🧾 Add Quotes
                </h3>

                <input
                  placeholder="Company Name"
                  value={quote.company_name}
                  onChange={(e) =>
                    setQuote({ ...quote, company_name: e.target.value })
                  }
                  className="w-full border p-3 rounded mb-3 placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans"
                />

                <input
                  type="number"
                  placeholder="Premium Amount"
                  value={quote.premium_amount}
                  onChange={(e) =>
                    setQuote({ ...quote, premium_amount: e.target.value })
                  }
                  className="w-full border p-3 rounded mb-3 placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans"
                />

                <button
                  onClick={handleAddQuote}
                  disabled={quoteLoading}
                  className={`w-full py-2 rounded font-semibold ${
                    quoteLoading ? 'bg-gray-400' : 'bg-blue-600 text-white'
                  }`}
                >
                  {quoteLoading ? 'Adding...' : '+ Add Quote'}
                </button>

                {quotes.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {quotes.map((q) => (
                      <div
                        key={q.id}
                        className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-white"
                      >
                        {editingQuoteId === q.id ? (
                          <div className="space-y-3">
                            <input
                              value={editQuote.company_name}
                              onChange={(e) =>
                                setEditQuote({
                                  ...editQuote,
                                  company_name: e.target.value,
                                })
                              }
                              className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white"
                              placeholder="Company Name"
                            />

                            <input
                              type="number"
                              value={editQuote.premium_amount}
                              onChange={(e) =>
                                setEditQuote({
                                  ...editQuote,
                                  premium_amount: e.target.value,
                                })
                              }
                              className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white"
                              placeholder="Premium Amount"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveQuote}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                              >
                                Save
                              </button>

                              <button
                                onClick={cancelEditQuote}
                                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center gap-3">
                            <div>
                              <p className="font-semibold">{q.company_name}</p>
                              <p className="text-gray-300">₹{q.premium_amount}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditQuote(q)}
                                className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-sm font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteQuote(q.id)}
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/20 pt-5">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  Add Follow-up Note
                </h3>

                <textarea
                  placeholder="Note details..."
                  value={note.text}
                  onChange={(e) => setNote({ ...note, text: e.target.value })}
                  className="w-full border p-3 rounded mb-3 placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans"
                />

                <input
                  type="date"
                  value={note.follow_up_date}
                  onChange={(e) =>
                    setNote({ ...note, follow_up_date: e.target.value })
                  }
                  className="w-full border p-3 rounded mb-3 text-yellow-600 font-semibold"
                />

                <label className="flex items-center gap-2 mb-3 text-teal-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={note.reminder}
                    onChange={(e) =>
                      setNote({ ...note, reminder: e.target.checked })
                    }
                  />
                  Reminder
                </label>

                <div className="bg-indigo-900 border border-white/20 rounded-xl p-4 mb-4">
                  <p className="text-white font-semibold mb-3">
                    Lead Priority
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        value: 'HOT',
                        label: '🔥 HOT',
                        active: 'bg-red-600 text-white border-red-400',
                      },
                      {
                        value: 'WARM',
                        label: '🌤 WARM',
                        active: 'bg-yellow-500 text-black border-yellow-300',
                      },
                      {
                        value: 'COOL',
                        label: '❄ COOL',
                        active: 'bg-blue-600 text-white border-blue-400',
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setNote({ ...note, priority: item.value })
                        }
                        className={`rounded-xl border px-4 py-3 font-semibold transition ${
                          note.priority === item.value
                            ? item.active
                            : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddNote}
                  disabled={noteLoading}
                  className={`w-full py-2 rounded font-semibold ${
                    noteLoading ? 'bg-gray-400' : 'bg-green-600 text-white'
                  }`}
                >
                  {noteLoading ? 'Saving...' : '+ Add Note & Finish'}
                </button>

                <button
                  onClick={finishWithoutNote}
                  className="w-full mt-3 py-2 rounded font-semibold bg-gray-700 text-white"
                >
                  Finish Without Note
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}