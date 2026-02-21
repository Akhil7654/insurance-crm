'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVehicleRenewals, renewVehicleClient, deleteClientFull } from '@/lib/api';

export default function VehicleRenewalsListPage() {
  const sp = useSearchParams();
  const month = sp.get('month') || '';
  const status = (sp.get('status') || 'pending') as 'pending' | 'missed';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!month) return;
    const data = await getVehicleRenewals(month, status);
    setItems(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [month, status]);

  const onRenew = async (clientId: number) => {
    const next = prompt('Enter NEXT RENEWAL DATE (YYYY-MM-DD)');
    if (!next) return;

    try {
      setLoading(true);
      await renewVehicleClient(clientId, next);
      await load();
      alert('Renewed ✅ moved to new date');
    } catch {
      alert('Renew failed');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteClient = async (clientId: number) => {
    const ok = confirm('This will DELETE the client and ALL data permanently. Continue?');
    if (!ok) return;

    try {
      setLoading(true);
      await deleteClientFull(clientId);
      await load();
      alert('Client deleted completely ✅');
    } catch {
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-300 p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-white mb-2">
          Vehicle Renewals — {status.toUpperCase()}
        </h1>
        <p className="text-gray-400 mb-5">Month: {month}</p>

        {items.length === 0 ? (
          <p className="text-gray-400">No items found.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.client.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-white font-bold">{it.client.name}</p>
                    <p className="text-gray-400 text-sm">{it.client.mobile} · {it.client.place}</p>
                    <p className="text-yellow-300 text-sm mt-2">
                      Renewal Date: {it.renewal_date || '-'}
                    </p>
                    <p className="text-gray-300 text-xs mt-2">
                      Vehicle: {it.vehicle_type} | Cover: {it.insurance_cover}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={loading}
                      onClick={() => onRenew(it.client.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      Renew
                    </button>

                    {status === 'missed' && (
                      <button
                        disabled={loading}
                        onClick={() => onDeleteClient(it.client.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                      >
                        Delete Client
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
