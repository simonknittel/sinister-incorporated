import clsx from "clsx";
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { FaSitemap } from "react-icons/fa";
import { serializeError } from "serialize-error";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { log } from "~/_lib/logging";
import { prisma } from "~/server/db";
import { Wip } from "../../../../_components/Wip";
import DeleteEntity from "./_components/DeleteEntity";
import Overview from "./_components/Overview";
import OverviewSkeleton from "./_components/OverviewSkeleton";
import Notes from "./_components/notes/Notes";
import NotesSkeleton from "./_components/notes/NotesSkeleton";
import Roles from "./_components/roles/Roles";
import RolesSkeleton from "./_components/roles/RolesSkeleton";
import styles from "./page.module.css";

const getEntity = cache(async (id: string) => {
  return prisma.entity.findUnique({
    where: {
      id,
    },
  });
});

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const entity = await getEntity(params.id);
    if (!entity) return {};

    return {
      title: `${entity.handle || entity.id} - Spynet | Sinister Incorporated`,
    };
  } catch (error) {
    log.error(
      "Error while generating metadata for /(app)/spynet/entity/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

interface Props {
  params: Params;
}

export default async function Page({ params }: Readonly<Props>) {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  const entity = await getEntity(params.id);
  if (!entity) notFound();

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
          prefetch={false}
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap">
          {entity.handle || entity.id}
        </h1>

        {authentication.authorize([
          {
            resource: "citizen",
            operation: "delete",
          },
        ]) && <DeleteEntity entity={entity} />}
      </div>

      <div className={clsx("mt-4", styles.pageGrid)}>
        <Suspense fallback={<OverviewSkeleton />}>
          <Overview entity={entity} />
        </Suspense>

        <Suspense fallback={<RolesSkeleton />}>
          <Roles entity={entity} />
        </Suspense>

        <section
          className="rounded-2xl p-4 lg:p-8 bg-neutral-800/50  flex flex-col"
          style={{
            gridArea: "organizations",
          }}
        >
          <h2 className="font-bold flex gap-2 items-center mb-8">
            <FaSitemap /> Organisationen
          </h2>

          <Wip />
        </section>

        <Suspense fallback={<NotesSkeleton />}>
          <Notes entity={entity} />
        </Suspense>
      </div>
    </main>
  );
}
