import { requireAuthentication } from "@/auth/server";
import clsx from "clsx";
import Avatar from "../Avatar";
import { LogoutButton } from "../LogoutButton";

interface Props {
  readonly isInDesktopSidebar?: boolean;
}

export const Account = async ({ isInDesktopSidebar = false }: Props) => {
  const authentication = await requireAuthentication();

  const name =
    authentication.session.user.name || authentication.session.discordId;

  const image = authentication ? authentication.session.user.image : undefined;

  return (
    <div
      className={clsx(
        "flex items-center justify-between border-b border-neutral-800 px-8 py-4",
        {
          "group-data-[navigation-collapsed]/navigation:px-4":
            isInDesktopSidebar,
        },
      )}
    >
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar name={name} image={image} size={48} />
        </div>

        <div
          className={clsx({
            "group-data-[navigation-collapsed]/navigation:hidden":
              isInDesktopSidebar,
          })}
        >
          <p>{name}</p>
        </div>
      </div>

      <LogoutButton
        className={clsx({
          "group-data-[navigation-collapsed]/navigation:hidden":
            isInDesktopSidebar,
        })}
      />
    </div>
  );
};
