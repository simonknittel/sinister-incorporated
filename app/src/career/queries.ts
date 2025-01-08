import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { cache } from "react";

export const getMyReadableFlows = cache(async () => {
  const authentication = await requireAuthentication();

  const allFlows = await prisma.flow.findMany({
    include: {
      nodes: {
        include: {
          sources: true,
          targets: true,
        },
      },
    },
  });

  const readableFlows = (
    await Promise.all(
      allFlows.map(async (flow) => {
        return {
          flow,
          include: await authentication.authorize("career", "read", [
            {
              key: "flowId",
              value: flow.id,
            },
          ]),
        };
      }),
    )
  )
    .filter(({ include }) => include)
    .map(({ flow }) => flow);

  return readableFlows;
});
