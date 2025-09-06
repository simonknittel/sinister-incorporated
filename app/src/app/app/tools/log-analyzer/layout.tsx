import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default function Layout({ children }: Props) {
  return <DefaultLayout title="Log Analyzer">{children}</DefaultLayout>;
}
