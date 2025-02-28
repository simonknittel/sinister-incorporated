import { requireAuthentication } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import { Link } from "@/common/components/Link";
import { SingleRole } from "@/common/components/SingleRole";
import { getPenaltyEntriesOfCurrentUser } from "@/penalty-points/queries";
import { getMyAssignedRoles } from "@/roles/utils/getRoles";
import clsx from "clsx";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaScaleBalanced } from "react-icons/fa6";

type Props = Readonly<{
  className?: string;
}>;

export const ProfileTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  if (!authentication.session.entityId) throw new Error("Forbidden");

  const name =
    authentication.session.user.name || authentication.session.discordId;
  const image = authentication.session.user.image;
  const roles = await getMyAssignedRoles();

  const [showSpynetLink, showPenaltyPoints] = await Promise.all([
    authentication.authorize("citizen", "read"),
    authentication.authorize("ownPenaltyEntry", "read"),
  ]);

  const penaltyPoints = showPenaltyPoints
    ? (await getPenaltyEntriesOfCurrentUser()).reduce(
        (previous, current) => (previous += current.points),
        0,
      )
    : undefined;

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col gap-4 items-center",
      )}
    >
      <Avatar name={name} image={image} size={128} />

      <h2 className="font-bold">{name}</h2>

      {roles.length > 0 ? (
        <div className="flex gap-2 flex-wrap justify-center">
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : null}

      {showPenaltyPoints && (
        <p
          title={`Aktive Strafpunkte: $ {penaltyPoints}`}
          className="rounded-full bg-neutral-700/50 px-3 flex gap-2 items-center"
        >
          <FaScaleBalanced className="text-xs text-neutral-500" />
          {penaltyPoints}
        </p>
      )}

      {showSpynetLink && (
        <Link
          href={`/app/spynet/citizen/${authentication.session.entityId}`}
          className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center"
        >
          Vollständiges Profil
          <FaExternalLinkAlt />
        </Link>
      )}
    </section>
  );
};
