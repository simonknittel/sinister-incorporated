import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Organization } from "@prisma/client";
import { cache } from "react";

export const getOrganizationById = cache(async (id: Organization["id"]) => {
  return getTracer().startActiveSpan("getOrganizationById", async (span) => {
    try {
      return await prisma.organization.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          spectrumId: true,
          name: true,
          logo: true,
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

export const getOrganizationBySpectrumId = async (
  spectrumId: Organization["spectrumId"],
) => {
  return getTracer().startActiveSpan(
    "getOrganizationBySpectrumId",
    async (span) => {
      try {
        return await prisma.organization.findFirst({
          where: {
            spectrumId,
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
    },
  );
};
