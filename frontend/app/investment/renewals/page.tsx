import { Suspense } from "react";
import InvestmentRenewalsClient from "./InvestmentRenewalsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <InvestmentRenewalsClient />
    </Suspense>
  );
}