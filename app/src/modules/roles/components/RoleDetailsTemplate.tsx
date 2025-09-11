import { SubNavigation } from "@/modules/common/components/SubNavigation";
import type { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { FaHome, FaLock, FaUsers } from "react-icons/fa";
import { TbHierarchy3 } from "react-icons/tb";

interface Props {
  readonly role: Role & {
    inherits: Role[];
  };
  readonly children: ReactNode;
}

export const RoleDetailsTemplate = ({ role, children }: Props) => {
  const pages = [
    {
      name: "Übersicht",
      icon: <FaHome />,
      path: `/app/roles/${role.id}`,
    },
    {
      name: "Berechtigungen",
      icon: <FaLock />,
      path: `/app/roles/${role.id}/permissions`,
    },
    {
      name: `Vererbungen (${role.inherits.length})`,
      icon: <TbHierarchy3 />,
      path: `/app/roles/${role.id}/inheritance`,
    },
    {
      name: "Citizen",
      icon: <FaUsers />,
      path: `/app/spynet/citizen?filters=role-${role.id}`,
    },
  ];

  return (
    <>
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <SubNavigation pages={pages} className="flex flex-wrap my-4" />

      {children}
    </>
  );
};
