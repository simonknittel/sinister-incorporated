import clsx from "clsx";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { FaSitemap } from "react-icons/fa";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import sinisterIcon from "../../../../../assets/Icons/Membership/logo_white.svg";
import DeleteEntity from "./_components/DeleteEntity";
import Overview from "./_components/Overview";
import OverviewSkeleton from "./_components/OverviewSkeleton";
import WIP from "./_components/WIP";
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
    include: {
      logs: {
        include: {
          attributes: {
            include: {
              createdBy: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          submittedBy: true,
        },
        orderBy: {
          createdAt: "desc",
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

    const latestConfirmedHandle = entity.logs.filter(
      (log) =>
        log.type === "handle" &&
        log.attributes.find(
          (attribute) =>
            attribute.key === "confirmed" && attribute.value === "confirmed"
        )
    )?.[0];

    return {
      title: `${
        latestConfirmedHandle?.content || entity.id
      } - Spynet | Sinister Incorporated`,
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
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  const entity = await getEntity(params.id);
  if (!entity) notFound();

  const latestConfirmedHandle = entity.logs.filter(
    (log) =>
      log.type === "handle" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0];

  return (
    <main className="p-4 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>{latestConfirmedHandle?.content || entity.id}</h1>

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
          className="rounded p-4 lg:p-8 bg-neutral-900 flex flex-col"
          style={{
            gridArea: "organizations",
          }}
        >
          <h2 className="font-bold flex gap-2 items-center mb-8">
            <FaSitemap /> Organisationen
          </h2>

          <WIP />
        </section>

        <section
          className="rounded p-4 lg:p-8 bg-sinister-radial-gradient flex flex-col"
          style={{
            gridArea: "sinister",
          }}
        >
          <h2 className="font-bold flex gap-1 items-center mb-8">
            <Image src={sinisterIcon as string} alt="" width={24} height={24} />{" "}
            Sinister Incorporated
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
