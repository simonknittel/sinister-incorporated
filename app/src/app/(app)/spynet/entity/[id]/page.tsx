import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { FaSitemap } from "react-icons/fa";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import sinisterIcon from "../../../../../assets/Icons/Membership/logo_white.svg";
import DeleteEntity from "./_components/DeleteEntity";
import Notes from "./_components/Notes";
import NotesSkeleton from "./_components/NotesSkeleton";
import Overview from "./_components/Overview";
import OverviewSkeleton from "./_components/OverviewSkeleton";
import Roles from "./_components/Roles";
import RolesSkeleton from "./_components/RolesSkeleton";
import WIP from "./_components/WIP";

const getEntity = cache(async (id: string) => {
  return prisma.entity.findUnique({
    where: {
      id,
    },
    include: {
      logs: {
        include: {
          attributes: {
            include: {
              createdBy: true,
            },
          },
        },
      },
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

    const latestHandle = entity.logs
      .filter((log) => log.type === "handle")
      .sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )?.[0]?.content;

    return {
      title: `${latestHandle || entity.id} - Spynet | Sinister Incorporated`,
    };
  } catch (error) {
    console.error(error);

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

interface Props {
  params: Params;
}

export default async function Page({ params }: Props) {
  await authenticateAndAuthorizePage("view-spynet");

  const entity = await getEntity(params.id);
  if (!entity) notFound();

  const sortedHandles = entity.logs
    .filter((log) => log.type === "handle")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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

        <Link
          href="/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Suche
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>{sortedHandles[0]?.content || entity.id}</h1>

        {(await authenticateAndAuthorizePage("delete-entity")) && (
          <DeleteEntity entity={entity} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
        <Suspense fallback={<OverviewSkeleton />}>
          <Overview entity={entity} />
        </Suspense>

        <Suspense fallback={<RolesSkeleton />}>
          <Roles entity={entity} />
        </Suspense>

        <section className="rounded p-4 lg:p-8 bg-neutral-900 flex flex-col">
          <h2 className="font-bold flex gap-2 items-center">
            <FaSitemap /> Organisationen
          </h2>

          <WIP />
        </section>

        <section className="rounded p-4 lg:p-8 bg-sinister-radial-gradient flex flex-col">
          <h2 className="font-bold flex gap-1 items-center">
            <Image src={sinisterIcon} alt="" width={24} height={24} /> Sinister
            Incorporated
          </h2>

          <WIP />
        </section>

        <Suspense fallback={<NotesSkeleton />}>
          <Notes entity={entity} />
        </Suspense>
      </div>
    </main>
  );
}
