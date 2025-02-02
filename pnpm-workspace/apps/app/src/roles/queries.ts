import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Role } from "@prisma/client";
import { cache } from "react";

/**
 * Use the methods from `getRoles.ts` preferably for correct permission management.
 */
export const getRoleById = cache(async (id: Role["id"]) => {
  return getTracer().startActiveSpan("getRoleById", async (span) => {
    try {
      return await prisma.role.findUnique({
        where: {
          id,
        },
        include: {
          permissionStrings: true,
          inherits: true,
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

/**
 * Use the methods from `getRoles.ts` preferably for correct permission management.
 */
export const getRoles = cache(async (withPermissionStrings = false) => {
  return getTracer().startActiveSpan("getRoles", async (span) => {
    try {
      return prisma.role.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          permissionStrings: withPermissionStrings,
          inherits: true,
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
