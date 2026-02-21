'use client';

import { useRouter } from 'next/navigation';

export default function FollowUpList({ notes }: any) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {notes.map((note: any) => (
        <div
          key={note.id}
          onClick={() =>
            router.push(`/vehicle/client/${note.client}`)
          }
          className="bg-black p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
        >
          <p className="font-semibold">{note.text}</p>
          <p className="text-sm text-gray-500">
            Follow-up: {note.follow_up_date}
          </p>
        </div>
      ))}
    </div>
  );
}
