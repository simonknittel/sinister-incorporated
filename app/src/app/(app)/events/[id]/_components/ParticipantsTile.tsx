import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaUsers } from "react-icons/fa";
import { type getEvent } from "~/_lib/discord/getEvent";
import { getEventUsers } from "~/_lib/discord/getEventUsers";
import { prisma } from "~/server/db";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const ParticipantsTile = async ({ className, event }: Props) => {
  const users = await getEventUsers(event.id);

  const entities = await prisma.entity.findMany({
    where: {
      discordId: {
        in: users.map((user) => user.user.id),
      },
    },
  });

  const resolvedUsers = users
    .map((user) => {
      const entity = entities.find(
        (entity) => entity.discordId === user.user.id,
      );

      return {
        entity,
        discord: user,
      };
    })
    .sort((a, b) => {
      return (
        a.entity?.handle ||
        a.discord.member.nick ||
        a.discord.user.global_name ||
        a.discord.user.username
      ).localeCompare(
        b.entity?.handle ||
          b.discord.member.nick ||
          b.discord.user.global_name ||
          b.discord.user.username,
      );
    });

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto",
      )}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaUsers />
        Teilnehmer ({event.user_count})
      </h2>

      {resolvedUsers.length > 0 ? (
        <div className="flex gap-2 flex-wrap mt-4">
          {resolvedUsers.map((resolvedUser) => (
            <div
              key={resolvedUser.discord.user.id}
              className="flex gap-2 rounded bg-neutral-800 p-1 pr-2 items-center"
            >
              <div className="rounded overflow-hidden">
                <Image
                  src={`https://cdn.discordapp.com/avatars/${resolvedUser.discord.user.id}/${resolvedUser.discord.member.avatar || resolvedUser.discord.user.avatar}.png`}
                  alt=""
                  width={32}
                  height={32}
                />
              </div>

              <span>
                {resolvedUser.entity?.handle ||
                  resolvedUser.discord.member.nick ||
                  resolvedUser.discord.user.global_name ||
                  resolvedUser.discord.user.username}
              </span>

              {resolvedUser.entity && (
                <Link
                  href={`/spynet/entity/${resolvedUser.entity.id}`}
                  prefetch={false}
                  className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center"
                  title="Spynet"
                >
                  <FaExternalLinkAlt />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4">Es sind keine Teilnehmer angemeldet.</p>
      )}
    </section>
  );
};
