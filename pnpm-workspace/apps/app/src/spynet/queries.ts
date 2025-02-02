import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { cache } from "react";

export const getAllNoteTypes = cache(async () => {
  return getTracer().startActiveSpan("getAllNoteTypes", async (span) => {
    try {
      return await prisma.noteType.findMany({
        orderBy: {
          name: "asc",
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

export const getAllClassificationLevels = cache(async () => {
  return getTracer().startActiveSpan(
    "getAllClassificationLevels",
    async (span) => {
      try {
        return await prisma.classificationLevel.findMany({
          orderBy: {
            name: "asc",
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
});
