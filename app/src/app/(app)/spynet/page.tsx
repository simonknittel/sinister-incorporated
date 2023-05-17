import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authorize } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";

export const metadata: Metadata = {
  title: "Spynet | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!authorize("view-spynet", session)) redirect("/dashboard");

  return (
    <main className="p-4 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Dashboard</h1>
      </div>
    </main>
  );
}
