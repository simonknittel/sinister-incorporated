import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Entity } from "@prisma/client";
import { cache } from "react";

export const getCitizens = async () => {
  return getTracer().startActiveSpan("getCitizens", async (span) => {
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

export const getCitizenById = cache(async (id: Entity["id"]) => {
  return getTracer().startActiveSpan("getCitizenById", async (span) => {
    try {
      return await prisma.entity.findUnique({
        where: {
          id,
        },
      });
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
