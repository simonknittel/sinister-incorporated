import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Logins | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (session!.user.role !== "admin") redirect("/events");

  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  const entityLogs = (
    await prisma.entityLog.findMany({
      where: {
        type: {
          in: ["discord-id", "handle"],
        },
      },
      include: {
        attributes: true,
      },
    })
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const enrichedUsers = users.map((user) => {
    const discordIdLog = entityLogs.find((log) => {
      return (
        log.type === "discord-id" &&
        log.content === user.accounts[0]!.providerAccountId &&
        log.attributes.find((attribute) => attribute.key === "confirmed")
      );
    });

    const entityId = discordIdLog?.entityId;

    if (!entityId)
      return {
        user,
        discordId: user.accounts[0]!.providerAccountId,
      };

    const handle = entityLogs.find(
      (log) =>
        log.type === "handle" &&
        log.entityId === entityId &&
        log.attributes.find((attribute) => attribute.key === "confirmed")
    );

    return {
      user,
      discordId: user.accounts[0]!.providerAccountId,
      entityId,
      handle: handle?.content,
    };
  });

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Logins</h1>

      <section className="p-4 lg:p-8 bg-neutral-900 rounded max-w-4xl mt-4">
        <UsersTable users={enrichedUsers} />
      </section>
    </main>
  );
}
