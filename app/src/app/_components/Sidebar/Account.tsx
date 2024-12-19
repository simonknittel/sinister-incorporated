import { requireAuthentication } from "@/auth/server";
import Avatar from "../Avatar";
import LogoutButton from "../LogoutButton";

export const Account = async () => {
  const authentication = await requireAuthentication();

  const name =
    authentication.session.user.name || authentication.session.discordId;

  const image = authentication ? authentication.session.user.image : undefined;

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar name={name} image={image} size={48} />
        </div>

        <div>
          <p>{name}</p>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};
