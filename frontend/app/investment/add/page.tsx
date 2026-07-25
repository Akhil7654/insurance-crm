'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createClient,
  createInvestmentDetails,
  createNote,
} from '@/lib/api';
import InvestmentConvertModal from '@/components/InvestmentConvertModal';

export default function InvestmentAddPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [converted, setConverted] = useState(false);

  const [clientId, setClientId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    place: '',
    investment_type: '',
    remarks: '',
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

    if (!form.name || !form.mobile) {
      alert('Fill required fields');
      return;
    }

    try {
      setLoading(true);

      const client = await createClient({
        name: form.name,
        mobile: form.mobile,
        place: form.place,
        insurance_type: 'investment',
      });

      await createInvestmentDetails({
        client: client.id,
        investment_type: form.investment_type,
        remarks: form.remarks,
      });

      setClientId(client.id);
      alert('Client created ✅ Now add a note or convert the lead');
    } catch {
      alert('Error saving data');
    } finally {
      setLoading(false);
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

      alert('Note added ✅');
      router.push('/investment');
    } catch {
      alert('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  const finishWithoutNote = () => {
    router.push('/investment');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-indigo-950 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-white">
          Add Investment Client
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
            name="investment_type"
            placeholder="Investment Type"
            value={form.investment_type}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <textarea
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
            disabled={clientId !== null}
            className="w-full border p-3 rounded placeholder:text-yellow-600 font-semibold italic text-yellow-600 font-sans disabled:opacity-60"
          />

          <button
            onClick={handleSubmit}
            disabled={loading || clientId !== null}
            className={`w-full py-3 rounded-xl font-semibold ${
              loading || clientId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-amber-600 text-white'
            }`}
          >
            {clientId ? 'Client Saved ✅' : loading ? 'Saving...' : 'Save Client'}
          </button>

          {clientId && (
            <>
              {/* CONVERT LEAD OPTION */}
              <div className="mt-6 border-t border-white/20 pt-5">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  🏆 Convert Lead
                </h3>

                {converted ? (
                  <p className="text-green-400 font-semibold">Lead converted ✅</p>
                ) : (
                  <button
                    onClick={() => setShowConvert(true)}
                    className="w-full py-2 rounded font-semibold bg-blue-600 text-white"
                  >
                    Convert This Lead
                  </button>
                )}
              </div>

              {/* FOLLOW UP NOTE */}
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
                      { value: 'HOT', label: '🔥 HOT', active: 'bg-red-600 text-white border-red-400' },
                      { value: 'WARM', label: '🌤 WARM', active: 'bg-yellow-500 text-black border-yellow-300' },
                      { value: 'COOL', label: '❄ COOL', active: 'bg-blue-600 text-white border-blue-400' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setNote({ ...note, priority: item.value })}
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

      {showConvert && clientId && (
        <InvestmentConvertModal
          clientId={clientId}
          onClose={() => setShowConvert(false)}
          onSuccess={() => setConverted(true)}
        />
      )}
    </div>
  );
}