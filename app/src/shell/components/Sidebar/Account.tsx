import { requireAuthentication } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import clsx from "clsx";
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
        "flex items-center justify-between border-b border-neutral-800 p-4",
        {
          "group-data-[navigation-collapsed]/navigation:p-2":
            isInDesktopSidebar,
        },
      )}
    >
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded-secondary">
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
