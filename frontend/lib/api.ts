const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// ---------------- CLIENT ----------------
export async function createClient(data: any) {
  const res = await fetch(`${API_BASE}/clients/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function getClientDetail(id: number) {
  const res = await fetch(`${API_BASE}/clients/${id}/`);
  if (!res.ok) throw new Error('Failed to load client');
  return res.json();
}

export async function updateClient(id: number, data: any) {
  const res = await fetch(`${API_BASE}/clients/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function deleteClient(id: number) {
  await fetch(`${API_BASE}/clients/${id}/`, { method: 'DELETE' });
}

// ---------------- VEHICLE ----------------
export async function createVehicleInsurance(data: any) {
  const res = await fetch(`${API_BASE}/vehicle-insurance/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create vehicle insurance');
  return res.json();
}

export async function getVehicleClients() {
  const res = await fetch(`${API_BASE}/clients/?insurance_type=vehicle`);
  if (!res.ok) throw new Error('Failed to load vehicle clients');
  return res.json();
}

// ---------------- ✅ HEALTH (NEW) ----------------
export async function createHealthInsurance(data: any) {
  const res = await fetch(`${API_BASE}/health-insurance/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create health insurance');
  return res.json();
}

export async function getHealthClients() {
  const res = await fetch(`${API_BASE}/clients/?insurance_type=health`);
  if (!res.ok) throw new Error('Failed to load health clients');
  return res.json();
}

// ---------------- NOTES ----------------
export async function createNote(data: any) {
  const res = await fetch(`${API_BASE}/notes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(id: number, data: any) {
  const res = await fetch(`${API_BASE}/notes/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update note failed');
  return res.json();
}

export async function deleteNote(id: number) {
  await fetch(`${API_BASE}/notes/${id}/`, { method: 'DELETE' });
}

export async function getClientHistory(id: number) {
  const res = await fetch(`${API_BASE}/clients/${id}/history/`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

// ---------------- QUOTES ----------------
export async function createQuote(data: any) {
  const res = await fetch(`${API_BASE}/quotes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create quote');
  return res.json();
}

// ---------------- DOCUMENTS (VEHICLE ONLY) ----------------
export async function getClientDocuments(clientId: number) {
  const res = await fetch(`${API_BASE}/documents/?client=${clientId}`);
  if (!res.ok) throw new Error('Failed to load documents');
  return res.json();
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_BASE}/documents/`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function deleteDocument(id: number) {
  await fetch(`${API_BASE}/documents/${id}/delete/`, {
    method: 'DELETE',
  });
}




// ---------------- HEALTH RENEWALS ----------------

export async function getHealthRenewalSummary(month: string) {
  const res = await fetch(`${API_BASE}/renewals/health/summary/?month=${month}`);
  if (!res.ok) throw new Error("Failed to load renewal summary");
  return res.json();
}

export async function getHealthRenewals(month: string, status: "pending" | "missed" ) {
  const res = await fetch(`${API_BASE}/renewals/health/?month=${month}&status=${status}`);
  if (!res.ok) throw new Error("Failed to load renewals list");
  return res.json();
}

export async function renewHealthClient(clientId: number, nextRenewalDate: string) {
  const res = await fetch(`${API_BASE}/renewals/health/${clientId}/renew/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ next_renewal_date: nextRenewalDate }),
  });
  if (!res.ok) throw new Error("Failed to renew");
  return res.json();
}

export async function deleteClientFull(clientId: number) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/full-delete/`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Full delete failed');
  return res.json();
}


// ---------------- VEHICLE RENEWALS ----------------

export async function getVehicleRenewalSummary(month: string) {
  const res = await fetch(`${API_BASE}/renewals/vehicle/summary/?month=${month}`);
  if (!res.ok) throw new Error("Failed to load vehicle renewal summary");
  return res.json();
}

export async function getVehicleRenewals(month: string, status: "pending" | "missed") {
  const res = await fetch(`${API_BASE}/renewals/vehicle/?month=${month}&status=${status}`);
  if (!res.ok) throw new Error("Failed to load vehicle renewals list");
  return res.json();
}

export async function renewVehicleClient(clientId: number, nextRenewalDate: string) {
  const res = await fetch(`${API_BASE}/renewals/vehicle/${clientId}/renew/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ next_renewal_date: nextRenewalDate }),
  });
  if (!res.ok) throw new Error("Failed to renew vehicle client");
  return res.json();
}

export async function setVehicleRenewalDate(clientId: number, renewalDate: string) {
  const res = await fetch(`${API_BASE}/renewals/vehicle/${clientId}/set/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ renewal_date: renewalDate }),
  });
  if (!res.ok) throw new Error("Failed to set renewal date");
  return res.json();
}
