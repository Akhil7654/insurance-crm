import { useState } from 'react';

type Note = {
  id: number;
  text: string;
  follow_up_date: string;
  reminder: boolean;
  priority?: 'HOT' | 'WARM' | 'COOL';
};

export default function HistoryTimeline({
  notes,
  onNoteUpdate,
  onNoteDelete,
}: {
  notes: Note[];
  onNoteUpdate: (
    note: Note,
    text: string,
    reminder: boolean,
    priority: 'HOT' | 'WARM' | 'COOL'
  ) => void;
  onNoteDelete: (note: Note) => void;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [reminder, setReminder] = useState(false);
  const [priority, setPriority] = useState<'HOT' | 'WARM' | 'COOL'>('HOT');

  const priorityStyle = (value: string) => {
    if (value === 'HOT') return 'bg-red-100 text-red-600';
    if (value === 'WARM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-5 text-white">Client History</h3>

      {notes.length === 0 && <p className="text-white text-sm">No history found</p>}

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="relative pl-6 border-l-4 border-blue-500 bg-gray-950 p-4 rounded-xl hover:shadow-sm transition"
          >
            {editId === note.id ? (
              <>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-3 rounded-xl mb-3 text-white bg-gray-900"
                />

                <label className="flex items-center gap-2 text-white text-sm mb-3 select-none">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Reminder
                </label>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-3">
                  <p className="text-white text-sm font-medium mb-3">Lead Priority</p>

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
                          setPriority(item.value as 'HOT' | 'WARM' | 'COOL')
                        }
                        className={`rounded-xl border px-4 py-2.5 font-semibold transition ${
                          priority === item.value
                            ? item.active
                            : 'bg-gray-950 text-gray-300 border-gray-700 hover:bg-gray-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onNoteUpdate(note, text, reminder, priority);
                      setEditId(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditId(null)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-white mb-1">{note.follow_up_date}</p>

                <p className="font-medium text-white">{note.text}</p>

                <div className="flex items-center gap-3 text-sm mt-3 flex-wrap">
                  <button
                    onClick={() => {
                      setEditId(note.id);
                      setText(note.text);
                      setReminder(!!note.reminder);
                      setPriority(note.priority || 'HOT');
                    }}
                    className="text-blue-500 hover:underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => confirm('Delete note?') && onNoteDelete(note)}
                    className="text-red-500 hover:underline font-medium cursor-pointer"
                  >
                    Delete
                  </button>

                  <span
                    className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${priorityStyle(
                      note.priority || 'HOT'
                    )}`}
                  >
                    {note.priority === 'WARM'
                      ? '🌤 WARM'
                      : note.priority === 'COOL'
                      ? '❄ COOL'
                      : '🔥 HOT'}
                  </span>

                  {note.reminder && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                      ⏰ Reminder
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}