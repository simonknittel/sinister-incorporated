"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const LogAnalyzer = dynamic(
  () =>
    import("@/log-analyzer/components/LogAnalyzer").then(
      (mod) => mod.LogAnalyzer,
    ),
  { ssr: false },
);

type Props = ComponentProps<typeof LogAnalyzer>;

export const LogAnalyzerWrapper = (props: Props) => {
  return <LogAnalyzer {...props} />;
};
