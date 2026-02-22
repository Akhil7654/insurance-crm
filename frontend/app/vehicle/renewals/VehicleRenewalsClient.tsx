'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getVehicleRenewals,
  renewVehicleClient,
  deleteClientFull,
} from '@/lib/api';

function RenewalsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-950 border border-gray-800 rounded-xl p-4 animate-pulse"
        >
          <div className="h-5 w-40 bg-gray-800 rounded mb-3" />
          <div className="h-4 w-56 bg-gray-800 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-800 rounded mb-3" />
          <div className="flex gap-2 mt-3">
            <div className="h-9 w-24 bg-gray-800 rounded-xl" />
            <div className="h-9 w-28 bg-gray-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VehicleRenewalsListPage() {
  const sp = useSearchParams();
  const month = sp.get('month') || '';
  const status = (sp.get('status') || 'pending') as 'pending' | 'missed';

  const [items, setItems] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  const load = async () => {
    if (!month) return;
    try {
      setLoadingList(true);
      const data = await getVehicleRenewals(month, status);
      setItems(data);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [month, status]);

  const onRenew = async (clientId: number) => {
    const next = prompt('Enter NEXT RENEWAL DATE (YYYY-MM-DD)');
    if (!next) return;

    try {
      setLoadingAction(true);
      await renewVehicleClient(clientId, next);
      await load();
      alert('Renewed ✅ moved to new date');
    } catch {
      alert('Renew failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const onDeleteClient = async (clientId: number) => {
    const ok = confirm(
      'This will DELETE the client and ALL data permanently. Continue?'
    );
    if (!ok) return;

    try {
      setLoadingAction(true);
      await deleteClientFull(clientId);
      await load();
      alert('Client deleted completely ✅');
    } catch {
      alert('Delete failed');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-300 p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-white mb-2">
          Vehicle Renewals — {status.toUpperCase()}
        </h1>
        <p className="text-gray-400 mb-5 text-sm">Month: {month}</p>

        {loadingList ? (
          <RenewalsSkeleton />
        ) : items.length === 0 ? (
          <p className="text-gray-400">No items found.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it: any) => (
              <div
                key={it.client.id}
                className="bg-gray-950 border border-gray-800 rounded-xl p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-white font-bold">
                      {it.client.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {it.client.mobile} · {it.client.place}
                    </p>
                    <p className="text-yellow-300 text-sm mt-2">
                      Renewal Date: {it.renewal_date || '-'}
                    </p>
                    <p className="text-gray-300 text-xs mt-2">
                      Vehicle: {it.vehicle_type} | Cover: {it.insurance_cover}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={loadingAction}
                      onClick={() => onRenew(it.client.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm"
                    >
                      Renew
                    </button>

                    {status === 'missed' && (
                      <button
                        disabled={loadingAction}
                        onClick={() => onDeleteClient(it.client.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm"
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