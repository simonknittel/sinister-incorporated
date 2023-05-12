import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import { authOptions } from "~/server/auth";

export const metadata: Metadata = {
  title: "Einreichen - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (["admin"].includes(session!.user.role) === false) redirect("/events");

  return (
    <main>
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:underline"
        >
          <FaChevronLeft className="mt-[.1em]" /> Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Einreichen</h1>
      </div>
    </main>
  );
}
