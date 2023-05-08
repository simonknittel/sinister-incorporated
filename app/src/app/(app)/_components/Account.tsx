import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import Avatar from "../../_components/Avatar";
import LogoutButton from "./LogoutButton";

const Account = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <div className="flex items-center justify-between border-b-2 border-neutral-800 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded">
          <Avatar
            name={session!.user.name}
            image={session!.user.image}
            size={48}
          />
        </div>

        <div>
          <p>{session!.user.name}</p>

          {session!.user.discordUsername &&
            session!.user.discordDiscriminator && (
              <p className="text-neutral-500 text-sm">
                {session!.user.discordUsername}#
                {session!.user.discordDiscriminator}
              </p>
            )}
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};

export default Account;
