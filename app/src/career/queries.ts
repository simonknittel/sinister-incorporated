import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import { cache } from "react";

export const getAllFlows = cache(
  withTrace("getAllFlows", async () => {
    return prisma.flow.findMany();
  }),
);

export const getMyReadableFlows = cache(
  withTrace("getMyReadableFlows", async () => {
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
  }),
);
