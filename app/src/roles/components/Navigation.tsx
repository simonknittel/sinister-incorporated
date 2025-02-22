import { Link } from "@/common/components/Link";
import type { Role } from "@prisma/client";
import clsx from "clsx";
import { FaHome, FaLock, FaUsers } from "react-icons/fa";
import { TbHierarchy3 } from "react-icons/tb";

type Props = Readonly<{
  className?: string;
  role: Role & {
    inherits: Role[];
  };
  active: string;
}>;

export const Navigation = ({ className, role, active }: Props) => {
  const pages = [
    {
      name: "Übersicht",
      icon: FaHome,
      path: `/app/roles/${role.id}`,
    },
    {
      name: "Berechtigungen",
      icon: FaLock,
      path: `/app/roles/${role.id}/permissions`,
    },
    {
      name: `Vererbungen (${role.inherits.length})`,
      icon: TbHierarchy3,
      path: `/app/roles/${role.id}/inheritance`,
    },
    {
      name: "Citizen",
      icon: FaUsers,
      path: `/app/spynet/citizen?filters=role-${role.id}`,
    },
  ];

  return (
    <div className={clsx("flex flex-wrap", className)}>
      {pages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          className={clsx(
            "first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase",
            {
              "bg-sinister-red-500 text-white": active === page.path,
              "text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300":
                active !== page.path,
            },
          )}
        >
          <page.icon />
          {page.name}
        </Link>
      ))}
    </div>
  );
};
