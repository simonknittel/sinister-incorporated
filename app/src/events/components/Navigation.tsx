import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import type { Entity, Event } from "@prisma/client";
import clsx from "clsx";
import { FaHome, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { isLineupVisible } from "../utils/isLineupVisible";

type Props = Readonly<{
  className?: string;
  event: Event & {
    managers: Entity[];
  };
  active: string;
}>;

export const Navigation = async ({ className, event, active }: Props) => {
  const authentication = await requireAuthentication();
  const [showLineup, showFleetLink] = await Promise.all([
    isLineupVisible(event),
    authentication.authorize("orgFleet", "read"),
  ]);

  const pages = [
    {
      name: "Übersicht",
      icon: FaHome,
      path: `/app/events/${event.id}`,
    },
    ...(showLineup
      ? [
          {
            name: "Aufstellung",
            icon: MdWorkspaces,
            path: `/app/events/${event.id}/lineup`,
          },
        ]
      : []),
    {
      name: "Teilnehmer",
      icon: FaUsers,
      path: `/app/events/${event.id}/participants`,
    },
    ...(showFleetLink
      ? [
          {
            name: "Flotte",
            icon: MdWorkspaces,
            path: `/app/events/${event.id}/fleet`,
          },
        ]
      : []),
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
