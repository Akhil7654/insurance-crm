'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getClientHistory,
  getClientDetail,
  createNote,
  updateNote,
  deleteNote,
  updateHealthInsurance,
} from '@/lib/api';

import ClientSummary from '@/components/ClientSummary';
import HistoryTimeline from '@/components/HistoryTimeline';
import QuotesSection from '@/components/QuotesSection';

export default function HealthClientHistoryPage() {
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [emiLoading, setEmiLoading] = useState(false);
  const [showEmiEditor, setShowEmiEditor] = useState(false);
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
        down_payment: data.health_details?.down_payment?.toString?.() || '',
        policy_tenure: data.health_details?.policy_tenure || '',
        emi_tenure: data.health_details?.emi_tenure || '',
        monthly_emi_amount: data.health_details?.monthly_emi_amount?.toString?.() || '',
      });
    });

    getClientHistory(clientId).then(setHistory);
  }, [clientId]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const hasEmiData = useMemo(() => {
    return Boolean(
      String(client?.health_details?.down_payment ?? '').trim() ||
        String(client?.health_details?.policy_tenure ?? '').trim() ||
        String(client?.health_details?.emi_tenure ?? '').trim() ||
        String(client?.health_details?.monthly_emi_amount ?? '').trim()
    );
  }, [client]);

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
    if (!client?.health_details?.id) return;

    try {
      setEmiLoading(true);

      const updatedHealth = await updateHealthInsurance(client.health_details.id, {
        down_payment: emi.down_payment === '' ? null : emi.down_payment,
        policy_tenure: emi.policy_tenure,
        emi_tenure: emi.emi_tenure,
        monthly_emi_amount: emi.monthly_emi_amount === '' ? null : emi.monthly_emi_amount,
      });

      setClient((prev: any) => ({
        ...prev,
        health_details: {
          ...(prev.health_details || {}),
          ...updatedHealth,
        },
      }));

      setShowEmiEditor(false);
      alert('EMI details saved ✅');
    } catch {
      alert('Failed to save EMI details');
    } finally {
      setEmiLoading(false);
    }
  };

  const handleDeleteEmi = async () => {
    if (!client?.health_details?.id) return;

    const ok = confirm('Delete EMI details for this client?');
    if (!ok) return;

    try {
      setEmiLoading(true);

      const updatedHealth = await updateHealthInsurance(client.health_details.id, {
        down_payment: null,
        policy_tenure: '',
        emi_tenure: '',
        monthly_emi_amount: null,
      });

      setClient((prev: any) => ({
        ...prev,
        health_details: {
          ...(prev.health_details || {}),
          ...updatedHealth,
        },
      }));

      setEmi({
        down_payment: '',
        policy_tenure: '',
        emi_tenure: '',
        monthly_emi_amount: '',
      });

      setShowEmiEditor(false);
      alert('EMI details deleted ✅');
    } catch {
      alert('Failed to delete EMI details');
    } finally {
      setEmiLoading(false);
    }
  };

  const openEmiEditor = () => {
    setEmi({
      down_payment: client?.health_details?.down_payment?.toString?.() || '',
      policy_tenure: client?.health_details?.policy_tenure || '',
      emi_tenure: client?.health_details?.emi_tenure || '',
      monthly_emi_amount: client?.health_details?.monthly_emi_amount?.toString?.() || '',
    });
    setShowEmiEditor(true);
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

        {/* ✅ EMI SECTION ONLY FOR HEALTH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-100">EMI Details</h2>

            {!showEmiEditor ? (
              <button
                onClick={openEmiEditor}
                className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-lg font-medium"
              >
                {hasEmiData ? 'Edit EMI' : 'Add EMI'}
              </button>
            ) : null}
          </div>

          {!showEmiEditor ? (
            hasEmiData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">Down Payment</p>
                  <p className="text-gray-100 font-medium">
                    {client.health_details?.down_payment ?? '-'}
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">Policy Tenure</p>
                  <p className="text-gray-100 font-medium">
                    {client.health_details?.policy_tenure || '-'}
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">EMI Tenure</p>
                  <p className="text-gray-100 font-medium">
                    {client.health_details?.emi_tenure || '-'}
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">Monthly EMI Amount</p>
                  <p className="text-gray-100 font-medium">
                    {client.health_details?.monthly_emi_amount ?? '-'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                No EMI details added for this client.
              </p>
            )
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Down Payment</label>
                  <input
                    type="number"
                    value={emi.down_payment}
                    onChange={(e) => setEmi({ ...emi, down_payment: e.target.value })}
                    placeholder="Enter down payment"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Policy Tenure</label>
                  <input
                    type="text"
                    value={emi.policy_tenure}
                    onChange={(e) => setEmi({ ...emi, policy_tenure: e.target.value })}
                    placeholder="Enter policy tenure"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">EMI Tenure</label>
                  <input
                    type="text"
                    value={emi.emi_tenure}
                    onChange={(e) => setEmi({ ...emi, emi_tenure: e.target.value })}
                    placeholder="Enter EMI tenure"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Monthly EMI Amount</label>
                  <input
                    type="number"
                    value={emi.monthly_emi_amount}
                    onChange={(e) => setEmi({ ...emi, monthly_emi_amount: e.target.value })}
                    placeholder="Enter monthly EMI amount"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveEmi}
                  disabled={emiLoading}
                  className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-lg font-medium"
                >
                  {emiLoading ? 'Saving...' : 'Save EMI Details'}
                </button>

                <button
                  onClick={() => setShowEmiEditor(false)}
                  disabled={emiLoading}
                  className="bg-gray-700 hover:bg-gray-600 transition text-white px-4 py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>

                {hasEmiData && (
                  <button
                    onClick={handleDeleteEmi}
                    disabled={emiLoading}
                    className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-3 rounded-lg font-medium"
                  >
                    {emiLoading ? 'Deleting...' : 'Delete EMI'}
                  </button>
                )}
              </div>
            </div>
          )}
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
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Follow-up Date</label>

                <input
                  type="date"
                  required
                  value={note.follow_up_date}
                  onChange={(e) => setNote({ ...note, follow_up_date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-5 h-5 accent-green-600"
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
              className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-medium"
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