import { useState } from "react";

export default function ConvertModal({ clientId, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    posp_code: "",
    customer_name: "",
    company_name: "",
    premium_amount: "",
    policy_number: "",
    customer_mobile: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:8000/api/convert-client/${clientId}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-black p-6 rounded-lg w-96 space-y-3">
        <h2 className="text-xl font-bold">Convert Lead</h2>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={(form as any)[key]}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        ))}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Save
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
