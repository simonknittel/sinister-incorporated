import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import clsx from "clsx";
import { FaHome, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";

type Props = Readonly<{
  className?: string;
  eventId: string;
  participantsCount: number;
  active: string;
}>;

export const Navigation = async ({
  className,
  eventId,
  participantsCount,
  active,
}: Props) => {
  const authentication = await requireAuthentication();
  const showFleetLink = await authentication.authorize("orgFleet", "read");

  const pages = [
    {
      name: "Übersicht",
      icon: FaHome,
      path: `/app/events/${eventId}`,
    },
    {
      name: `Teilnehmer (${participantsCount})`,
      icon: FaUsers,
      path: `/app/events/${eventId}/participants`,
    },
    ...(showFleetLink
      ? [
          {
            name: "Flotte",
            icon: MdWorkspaces,
            path: `/app/events/${eventId}/fleet`,
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
            "first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase",
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
