"use client";

import dynamic from "next/dynamic";

const AnalyticsContainer = dynamic(
  () => import("@/common/components/AnalyticsContainer"),
  { ssr: false },
);

export const AnalyticsLoader = () => {
  return <AnalyticsContainer />;
};
