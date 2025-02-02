import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";

export const getCitizen = async () => {
  return getTracer().startActiveSpan("getCitizen", async (span) => {
    try {
      return await prisma.entity.findMany();
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};
