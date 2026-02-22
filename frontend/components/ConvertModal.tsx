'use client';

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function ConvertModal({ clientId, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    posp_code: "",
    customer_name: "",
    company_name: "",
    premium_amount: "",
    policy_number: "",
    customer_mobile: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/convert-client/${clientId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          premium_amount: Number(form.premium_amount || 0), // optional safe convert
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Convert failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Convert failed: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-black p-6 rounded-lg w-96 space-y-3 text-white">
        <h2 className="text-xl font-bold">Convert Lead</h2>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={(form as any)[key]}
            onChange={handleChange}
            className="w-full border p-2 rounded text-black"
          />
        ))}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-green-500 disabled:opacity-60 text-white px-4 py-2 rounded cursor-pointer"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-400 text-black px-4 py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}