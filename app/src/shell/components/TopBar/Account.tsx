import { requireAuthentication } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import { Popover } from "@/common/components/Popover";
import clsx from "clsx";
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
    <Popover
      trigger={
        <button
          type="button"
          className={clsx(
            "p-2 rounded-l-secondary hover:background-tertiary focus-visible:background-tertiary",
            className,
          )}
        >
          <div className="overflow-hidden rounded-secondary">
            <Avatar name={name} image={image} size={32} />
          </div>
        </button>
      }
      childrenClassName="w-80"
    >
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded-secondary">
          <Avatar name={name} image={image} size={64} />
        </div>

        <div>
          <p className="text-lg">{name}</p>
        </div>
      </div>

      <Logout className="mt-4" />
    </Popover>
  );
};
