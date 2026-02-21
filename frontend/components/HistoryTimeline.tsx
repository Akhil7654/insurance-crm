import { useState } from 'react';

type Note = {
  id: number;
  text: string;
  follow_up_date: string;
  reminder: boolean;
};

export default function HistoryTimeline({
  notes,
  onNoteUpdate,
  onNoteDelete,
}: {
  notes: Note[];
  onNoteUpdate: (note: Note, text: string) => void;
  onNoteDelete: (note: Note) => void;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [text, setText] = useState('');

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-5 text-white">
        Client History
      </h3>

      {notes.length === 0 && (
        <p className="text-white text-sm">No history found</p>
      )}

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
                  className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-3 rounded-xl mb-3"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onNoteUpdate(note, text);
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
                <p className="text-xs text-white mb-1">
                  {note.follow_up_date}
                </p>

                <p className="font-medium text-white">
                  {note.text}
                </p>

                <div className="flex items-center gap-4 text-sm mt-2">
                  <button
                    onClick={() => {
                      setEditId(note.id);
                      setText(note.text);
                    }}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      confirm('Delete note?') && onNoteDelete(note)
                    }
                    className="text-red-600 hover:underline font-medium cursor-pointer"
                  >
                    Delete
                  </button>

                  {note.reminder && (
                    <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
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
