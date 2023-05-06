import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Mitglieder | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (["leadership", "admin"].includes(session!.user.role) === false)
    redirect("/fleet");

  const members = await prisma.user.findMany();

  return (
    <main>
      <h1 className="text-xl font-bold">Mitglieder</h1>

      <section className="p-8 bg-neutral-900 rounded max-w-4xl mt-4">
        <UsersTable users={members} />
      </section>
    </main>
  );
}
