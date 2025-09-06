import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import type { Page } from "@/common/components/layouts/DefaultLayout/Navigation";
import type { ReactNode } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

interface Props {
  readonly children?: ReactNode;
}

export default function Layout({ children }: Props) {
  const pages: Page[] = [
    {
      icon: <FaExternalLinkAlt />,
      name: "In einem neuen Tab öffnen",
      path: "/dogfight-trainer",
      external: true,
    },
  ];

  return (
    <DefaultLayout
      title="Dogfight Trainer"
      pages={pages}
      disableChildrenPadding
    >
      {children}
    </DefaultLayout>
  );
}
