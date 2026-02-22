import { Suspense } from "react";
import VehicleRenewalsClient from "./VehicleRenewalsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <VehicleRenewalsClient />
    </Suspense>
  );
}