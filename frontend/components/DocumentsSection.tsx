'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClientDocuments, uploadDocument, deleteDocument } from '@/lib/api';

type Document = {
  id: number;
  document_type: string;
  file: string;
  uploaded_at: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18Z" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
);

const inputClass =
  'w-full bg-[#0A0E16] border border-white/[0.08] focus:border-[#5B8DEF]/50 text-[#F4F6FA] text-sm p-3 rounded-xl outline-none transition-colors';

export default function DocumentsSection({ clientId }: { clientId: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentType, setDocumentType] = useState('rc');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_ORIGIN = useMemo(() => {
    try {
      return new URL(API_BASE).origin;
    } catch {
      return 'http://127.0.0.1:8000';
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;
    getClientDocuments(clientId).then(setDocuments).catch(() => setDocuments([]));
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
    <div className="rounded-2xl bg-[#0F1420] border border-white/[0.06] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/[0.12] text-[#5B8DEF]">
          <FolderIcon />
        </span>
        <h2 className="text-[15px] font-medium text-[#F4F6FA]">Client Documents</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-3 mb-6 pb-6 border-b border-white/[0.06]">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className={inputClass}
        >
          <option className="bg-[#0A0E16]" value="rc">RC</option>
          <option className="bg-[#0A0E16]" value="aadhaar">Aadhaar</option>
          <option className="bg-[#0A0E16]" value="policy">Old Policy</option>
        </select>

        <input
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-[#7C879E] text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-white/[0.08] file:bg-white/[0.04] file:text-[#F4F6FA] file:text-[13px] file:font-medium hover:file:bg-white/[0.08] file:cursor-pointer cursor-pointer"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 bg-[#5B8DEF]/10 hover:bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <UploadIcon /> {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      {documents.length === 0 ? (
        <p className="text-[#565F76] text-[13px]">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc) => {
            const fileUrl = doc.file.startsWith('http')
              ? doc.file
              : `${BACKEND_ORIGIN}${doc.file}`;

            return (
              <div
                key={doc.id}
                className="flex justify-between items-center bg-[#0A0E16] border border-white/[0.08] p-4 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#7C879E]">
                    <FileIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[14px] text-[#F4F6FA] capitalize truncate">
                      {doc.document_type.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-[#565F76] font-mono">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5B8DEF] hover:text-[#7ba3f5] text-[13px] font-medium transition-colors"
                  >
                    View
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-[#EF6461] hover:text-[#f18178] transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}