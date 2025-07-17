import AllAuction from "@/components/auctions/all-deals";
import { PageHeader } from "@/Shared/PageHeader";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div className="">
      <PageHeader title="Alle Deals" imge="/assets/DealsFinalpic.jpg" />
      <div className=" container">
        <Suspense fallback={<div>Loading...</div>}>
          <AllAuction />
        </Suspense>
      </div>
    </div>
  );
}
