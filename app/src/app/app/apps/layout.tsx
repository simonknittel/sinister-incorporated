import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <DefaultLayout title="Apps" slug="apps">
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
