import { Suspense } from "react";
import HealthRenewalsClient from "./HealthRenewalsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HealthRenewalsClient />
    </Suspense>
  );
}