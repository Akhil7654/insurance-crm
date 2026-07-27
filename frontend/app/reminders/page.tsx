import { Suspense } from "react";
import ReminderDashboardClient from "./ReminderDashboardClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05070C]" />}>
      <ReminderDashboardClient />
    </Suspense>
  );
}