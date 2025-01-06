import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { log } from "@/logging";
import { OverviewTab } from "@/roles/components/OverviewTab";
import { getRoleById } from "@/roles/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { FaHome, FaLock, FaUsers } from "react-icons/fa";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const role = await getRoleById((await props.params).id);

    return {
      title: `${role?.name} - Rollen | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/roles/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/roles");
  await authentication.authorizePage("role", "manage");

  const role = await getRoleById((await params).id);
  if (!role) notFound();

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <div className="flex flex-wrap mt-2">
        <Link
          href={`/app/roles/${role.id}`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase bg-sinister-red-500 text-white"
        >
          <FaHome />
          Übersicht
        </Link>

        <Link
          href={`/app/roles/${role.id}/permissions`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
        >
          <FaLock />
          Berechtigungen
        </Link>

        <Link
          href={`/app/spynet/citizen?filters=role-${role.id}`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
        >
          <FaUsers />
          Citizen
        </Link>
      </div>

      <OverviewTab role={role} className="mt-2" />
    </main>
  );
}
