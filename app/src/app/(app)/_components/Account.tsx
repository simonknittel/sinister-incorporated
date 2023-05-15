import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import Avatar from "../../_components/Avatar";
import LogoutButton from "./LogoutButton";

const Account = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex items-center justify-between border-b-2 border-neutral-800 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar
            name={session!.user.name || session!.discordId}
            image={session!.user.image}
            size={48}
          />
        </div>

        <div>
          <p>{session!.user.name || session!.discordId}</p>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};

export default Account;
