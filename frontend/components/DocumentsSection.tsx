'use client';

import { useEffect, useState } from 'react';
import { getClientDocuments, uploadDocument, deleteDocument } from '@/lib/api';

type Document = {
  id: number;
  document_type: string;
  file: string;
  uploaded_at: string;
};

export default function DocumentsSection({ clientId }: { clientId: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentType, setDocumentType] = useState('rc');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    getClientDocuments(clientId).then(setDocuments);
  }, [clientId]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('client', String(clientId));
    formData.append('document_type', documentType);
    formData.append('file', file);

    try {
      setLoading(true);
      const newDoc = await uploadDocument(formData);
      setDocuments((prev) => [newDoc, ...prev]);
      setFile(null);
    } catch {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm('Delete this document?');
    if (!ok) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
      <h2 className="text-xl font-semibold mb-5 text-white">
        Client Documents
      </h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4 mb-6 text-white">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-3 rounded-xl cursor-pointer"
        >
          <option value="rc" className='text-black'>RC</option>
          <option value="aadhaar" className='text-black'>Aadhaar</option>
          <option value="policy" className='text-black'>Old Policy</option>
        </select>

        <input
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-200 p-2 rounded-xl cursor-pointer"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold shadow transition cursor-pointer"
        >
          {loading ? 'Uploading...' : '+ Upload Document'}
        </button>
      </form>

      {/* Document List */}
      {documents.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No documents uploaded yet
        </p>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc) => {
            const fileUrl = doc.file.startsWith('http')
              ? doc.file
              : `http://127.0.0.1:8000${doc.file}`;

            return (
              <li
                key={doc.id}
                className="flex justify-between items-center bg-gray-950 border border-gray-200 p-4 rounded-xl hover:shadow-sm transition"
              >
                <div>
                  <p className="font-medium text-white capitalize">
                    {doc.document_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
