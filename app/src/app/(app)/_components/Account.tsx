import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
import Avatar from "../../_components/Avatar";
import LogoutButton from "./LogoutButton";

const Account = async () => {
  const authentication = await requireAuthentication();

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar
            name={
              authentication.session.user.name ||
              authentication.session.discordId
            }
            image={
              authentication ? authentication.session.user.image : undefined
            }
            size={48}
          />
        </div>

        <div>
          <p>
            {authentication.session.user.name ||
              authentication.session.discordId}
          </p>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};

export default Account;
