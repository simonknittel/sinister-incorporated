"use client";

import { Analytics } from "@vercel/analytics/react";

const AnalyticsContainer = () => {
  return (
    <Analytics
      beforeSend={(e) =>
        localStorage.getItem("va-disabled") === "true" ? null : e
      }
    />
  );
};

export default AnalyticsContainer;
