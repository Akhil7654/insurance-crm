'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getClientHistory,
  getClientDetail,
  createNote,
  updateNote,
  deleteNote,
  updateVehicleInsurance,
} from '@/lib/api';

import ClientSummary from '@/components/ClientSummary';
import HistoryTimeline from '@/components/HistoryTimeline';
import QuotesSection from '@/components/QuotesSection';
import DocumentsSection from '@/components/DocumentsSection';

export default function ClientHistoryPage() {
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [emiLoading, setEmiLoading] = useState(false);
  const [emi, setEmi] = useState({
    down_payment: '',
    policy_tenure: '',
    emi_tenure: '',
    monthly_emi_amount: '',
  });

  const [note, setNote] = useState({
    text: '',
    follow_up_date: '',
    reminder: true,
  });

  useEffect(() => {
    if (!clientId) return;

    getClientDetail(clientId).then((data) => {
      setClient(data);
      setConversions(data.conversions || []);
      setEmi({
        down_payment: data.vehicle_details?.down_payment?.toString?.() || '',
        policy_tenure: data.vehicle_details?.policy_tenure || '',
        emi_tenure: data.vehicle_details?.emi_tenure || '',
        monthly_emi_amount: data.vehicle_details?.monthly_emi_amount?.toString?.() || '',
      });
    });

    getClientHistory(clientId).then(setHistory);
  }, [clientId]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newNote = await createNote({ client: clientId, ...note });
      setHistory((prev) => [newNote, ...prev]);
      setNote({ text: '', follow_up_date: '', reminder: true });
    } finally {
      setLoading(false);
    }
  };

  const handleNoteUpdate = async (noteObj: any, text: string, reminder: boolean) => {
    const updated = await updateNote(noteObj.id, { text, reminder });
    setHistory((prev) => prev.map((n) => (n.id === noteObj.id ? updated : n)));
  };

  const handleNoteDelete = async (noteObj: any) => {
    await deleteNote(noteObj.id);
    setHistory((prev) => prev.filter((n) => n.id !== noteObj.id));
  };

  const handleSaveEmi = async () => {
    if (!client?.vehicle_details?.id) return;

    try {
      setEmiLoading(true);

      const updatedVehicle = await updateVehicleInsurance(client.vehicle_details.id, {
        down_payment: emi.down_payment === '' ? 0 : emi.down_payment,
        policy_tenure: emi.policy_tenure,
        emi_tenure: emi.emi_tenure,
        monthly_emi_amount: emi.monthly_emi_amount === '' ? 0 : emi.monthly_emi_amount,
      });

      setClient((prev: any) => ({
        ...prev,
        vehicle_details: {
          ...(prev.vehicle_details || {}),
          ...updatedVehicle,
        },
      }));

      alert('EMI details saved ✅');
    } catch {
      alert('Failed to save EMI details');
    } finally {
      setEmiLoading(false);
    }
  };

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-300">
        <p className="text-gray-800 text-lg font-bold font-sans">
          Just a Moment - Loading Client Details..
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ClientSummary client={client} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <QuotesSection clientId={client.id} quotes={client.quotes} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DocumentsSection clientId={client.id} />
        </motion.div>

        {/* ✅ EMI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-100">EMI Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              value={emi.down_payment}
              onChange={(e) => setEmi({ ...emi, down_payment: e.target.value })}
              placeholder="Down Payment"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={emi.policy_tenure}
              onChange={(e) => setEmi({ ...emi, policy_tenure: e.target.value })}
              placeholder="Policy Tenure"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={emi.emi_tenure}
              onChange={(e) => setEmi({ ...emi, emi_tenure: e.target.value })}
              placeholder="EMI Tenure"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              value={emi.monthly_emi_amount}
              onChange={(e) => setEmi({ ...emi, monthly_emi_amount: e.target.value })}
              placeholder="Monthly EMI Amount"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSaveEmi}
            disabled={emiLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-medium"
          >
            {emiLoading ? 'Saving...' : 'Save EMI Details'}
          </button>
        </motion.div>

        {conversions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              Converted Lead Details
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-200 border border-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-3 border border-gray-700">POSP</th>
                    <th className="p-3 border border-gray-700">Customer Name</th>
                    <th className="p-3 border border-gray-700">Company</th>
                    <th className="p-3 border border-gray-700">Premium</th>
                    <th className="p-3 border border-gray-700">Policy</th>
                    <th className="p-3 border border-gray-700">Mobile</th>
                  </tr>
                </thead>

                <tbody>
                  {conversions.map((c: any) => (
                    <tr key={c.id} className="text-center hover:bg-gray-800 transition">
                      <td className="p-3 border border-gray-800">{c.posp_code}</td>
                      <td className="p-3 border border-gray-800">{c.customer_name}</td>
                      <td className="p-3 border border-gray-800">{c.company_name}</td>
                      <td className="p-3 border border-gray-800">₹{c.premium_amount}</td>
                      <td className="p-3 border border-gray-800">{c.policy_number}</td>
                      <td className="p-3 border border-gray-800">{c.customer_mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
            Add New Follow-up Note
          </h2>

          <form onSubmit={handleAddNote} className="space-y-4">
            <textarea
              required
              value={note.text}
              onChange={(e) => setNote({ ...note, text: e.target.value })}
              placeholder="Write your follow-up note..."
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Follow-up Date</label>

                <input
                  type="date"
                  required
                  value={note.follow_up_date}
                  onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {note.follow_up_date && (
                  <p className="text-xs text-gray-500">
                    Selected: {formatDate(note.follow_up_date)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
                <input
                  type="checkbox"
                  checked={note.reminder}
                  onChange={(e) => setNote({ ...note, reminder: e.target.checked })}
                  className="w-5 h-5 accent-blue-600"
                />

                <div>
                  <p className="text-gray-100 font-medium">Enable Reminder</p>
                  <p className="text-xs text-gray-400">Get notified on follow-up date</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-medium"
            >
              {loading ? 'Saving...' : '+ Add Note'}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <HistoryTimeline
            notes={history}
            onNoteUpdate={handleNoteUpdate}
            onNoteDelete={handleNoteDelete}
          />
        </motion.div>
      </div>
    </div>
  );
}