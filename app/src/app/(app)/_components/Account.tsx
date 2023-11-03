import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import Avatar from "../../_components/Avatar";
import LogoutButton from "./LogoutButton";

const Account = async () => {
  const authentication = await authenticate();

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar
            name={
              authentication
                ? authentication.session.user.name ||
                  authentication.session["discord-id"]
                : undefined
            }
            image={
              authentication ? authentication.session.user.image : undefined
            }
            size={48}
          />
        </div>

        <div>
          <p>
            {authentication
              ? authentication.session.user.name ||
                authentication.session["discord-id"]
              : null}
          </p>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};

export default Account;
