import { type Metadata } from "next";
import Link from "next/link";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAssignableRoles from "~/app/_lib/getAssignableRoles";
import getLatestConfirmedCitizenAttributes from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import getRoles from "~/app/_lib/getRoles";
import { prisma } from "~/server/db";
import Table from "./_components/Table";

export const metadata: Metadata = {
  title: "Citizen - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  const page = 1;
  const perPage = 50;

  const entities = await prisma.entity.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
    take: perPage,
    skip: (page - 1) * perPage,
  });

  const rows = await Promise.all(
    entities.map(async (entity) => {
      return {
        ...getLatestConfirmedCitizenAttributes(entity),
        roles: await getRoles(entity),
        entity,
      };
    })
  );

  const assignableRoles = await getAssignableRoles();

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Citizen</h1>
      </div>

      <section className="p-8 pb-10 bg-neutral-900 mt-4 rounded overflow-auto">
        <Table rows={rows} assignableRoles={assignableRoles} />

        {/* <div className="flex justify-center">
          <Pagination className="mt-4" />
        </div> */}
      </section>
    </main>
  );
}
