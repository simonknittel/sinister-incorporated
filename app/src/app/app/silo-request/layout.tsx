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
      path: "https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform",
      external: true,
    },
  ];

  return (
    <DefaultLayout title="SILO-Anfrage" pages={pages} disableChildrenPadding>
      {children}
    </DefaultLayout>
  );
}
