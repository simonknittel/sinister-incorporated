import { SubNavigation } from "@/common/components/SubNavigation";
import type { Role } from "@prisma/client";
import clsx from "clsx";
import { FaHome, FaLock, FaUsers } from "react-icons/fa";
import { TbHierarchy3 } from "react-icons/tb";

interface Props {
  readonly className?: string;
  readonly role: Role & {
    inherits: Role[];
  };
}

export const Navigation = ({ className, role }: Props) => {
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
    <SubNavigation
      pages={pages}
      className={clsx("flex flex-wrap", className)}
    />
  );
};
