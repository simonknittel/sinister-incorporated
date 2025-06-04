import { SubNavigation } from "@/common/components/SubNavigation";
import type { ReactNode } from "react";

const pages = [
  {
    name: "Übersicht",
    path: "/app/roles",
  },
  {
    name: "Berechtigungsmatrix",
    path: "/app/roles/permission-matrix",
  },
];

interface Props {
  readonly children: ReactNode;
}

export const RolesOverviewTemplate = ({ children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Rollen</h1>

      <SubNavigation pages={pages} className="flex flex-wrap" />

      {children}
    </main>
  );
};
