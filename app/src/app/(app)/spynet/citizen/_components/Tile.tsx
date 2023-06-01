import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAssignableRoles from "~/app/_lib/getAssignableRoles";
import getLatestConfirmedCitizenAttributes from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import getRoles from "~/app/_lib/getRoles";
import { prisma } from "~/server/db";
import Table from "./Table";

const Tile = async () => {
	const authentication = await authenticate();

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
        ...(await getLatestConfirmedCitizenAttributes(entity)),
        roles: await getRoles(entity),
        entity,
      };
    })
  );

  const assignableRoles = await getAssignableRoles();

  const showLastSeenAtColumn = authentication && authentication.authorize([
    {
      resource: "lastSeen",
      operation: "read",
    },
  ]);

	return (
      <section className="p-8 pb-10 bg-neutral-900 mt-4 rounded overflow-auto">
        <Table
          rows={rows}
          assignableRoles={assignableRoles}
          showLastSeenAtColumn={showLastSeenAtColumn}
        />

        {/* <div className="flex justify-center">
          <Pagination className="mt-4" />
        </div> */}
      </section>
	);
};

export default Tile;
