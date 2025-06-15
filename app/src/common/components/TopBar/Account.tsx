import { requireAuthentication } from "@/auth/server";
import clsx from "clsx";
import Avatar from "../Avatar";
import { Logout } from "./Logout";

interface Props {
  readonly className?: string;
}

export const Account = async ({ className }: Props) => {
  const authentication = await requireAuthentication();

  const name =
    authentication.session.user.name || authentication.session.discordId;

  const image = authentication ? authentication.session.user.image : undefined;

  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded-secondary">
          <Avatar name={name} image={image} size={32} />
        </div>

        <div>
          <p>{name}</p>
        </div>
      </div>

      <Logout />
    </div>
  );
};
