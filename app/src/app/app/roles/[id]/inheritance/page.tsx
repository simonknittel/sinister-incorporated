import { authenticatePage } from "@/auth/server";
import { SingleRole } from "@/common/components/SingleRole";
import { log } from "@/logging";
import { InheritanceForm } from "@/roles/components/InheritanceForm";
import { Navigation } from "@/roles/components/Navigation";
import { getRoleById, getRoles } from "@/roles/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
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
      title: `${role?.name} - Vererbungen | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/roles/[id]/inheritance/page.tsx",
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

  const roleId = (await params).id;
  const role = await getRoleById(roleId);
  if (!role) notFound();

  const roles = await getRoles();
  const _roles = roles
    .filter((r) => r.id !== role.id)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <Navigation
        role={role}
        active={`/app/roles/${roleId}/inheritance`}
        className="mt-2"
      />

      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 mt-4">
        <h2 className="text-xl font-bold mb-2">Vererbungen</h2>
        <p>
          Die Rolle <SingleRole role={role} className="inline-flex align-sub" />{" "}
          erhält alle Berechtigungen von den folgenden ausgewählten Rollen. Im
          Karrieresystem gelten die folgenden Rollen ebenfalls als
          freigeschaltet. Verschachtelte Vererbungen werden nicht
          berücksichtigt.
        </p>

        <InheritanceForm currentRole={role} roles={_roles} className="mt-4" />
      </section>
    </main>
  );
}
