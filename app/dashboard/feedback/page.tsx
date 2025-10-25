import Layout from "@/components/dashboard/layout";
import React from "react";
import FeedbackList from "./_components/feedbackList";

function page() {
  return (
    <Layout>
      <FeedbackList />
    </Layout>
  );
}

export default page;
