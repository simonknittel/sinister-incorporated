import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { cache } from "react";

export const getMyReadableFlows = cache(async () => {
  return getTracer().startActiveSpan("getMyReadableFlows", async (span) => {
    try {
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});
