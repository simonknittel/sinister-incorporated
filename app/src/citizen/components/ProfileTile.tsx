import { requireAuthentication } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import { Link } from "@/common/components/Link";
import { SingleRole } from "@/common/components/SingleRole";
import { getMyAssignedAndVisibleRoles } from "@/roles/utils/getAssignedAndVisibleRoles";
import clsx from "clsx";
import { FaExternalLinkAlt } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
}>;

export const ProfileTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();

  const name =
    authentication.session.user.name || authentication.session.discordId;
  const image = authentication.session.user.image;
  const roles = await getMyAssignedAndVisibleRoles();

  const showLink =
    authentication.session.entityId &&
    (await authentication.authorize("citizen", "read"));

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

      {showLink && (
        <Link
          href={`/app/spynet/entity/${authentication.session.entityId}`}
          className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center"
        >
          Vollständiges Profil
          <FaExternalLinkAlt />
        </Link>
      )}
    </section>
  );
};
