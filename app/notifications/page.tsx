import Notifications from "@/components/Notifications";
import { PageHeader } from "@/Shared/PageHeader";
import React from "react";

const page = () => {
  return (
    <div className="">
      <PageHeader title="Benachrichtigungen" imge="/assets/notifications.jpg" />
      <div className="py-28 container">
        <Notifications />
      </div>
    </div>
  );
};

export default page;
