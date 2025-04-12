import { authenticate, type requireAuthentication } from "@/auth/server";
import { log } from "@/logging";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import type { z } from "zod";

type Return = Promise<
  | { success: string }
  | { error: string; errorDetails?: unknown; requestPayload: FormData }
>;

export const createAuthenticatedAction = <T extends z.ZodTypeAny>(
  name: string,
  zodSchema: T,
  action: (
    formData: FormData,
    authentication: Exclude<
      Awaited<ReturnType<typeof requireAuthentication>>,
      false
    >,
    data: z.infer<T>,
  ) => Return,
): ((formData: FormData) => Return) => {
  return async (formData: FormData) => {
    try {
      return getTracer().startActiveSpan(name, async (span) => {
        try {
          /**
           * Authenticate the request
           */
          const authentication = await authenticate();
          if (!authentication)
            return {
              error: "Du bist nicht berechtigt diese Aktion auszuführen.",
              requestPayload: formData,
            };

          /**
           * Validate the request
           */
          const result = zodSchema.safeParse(
            Object.fromEntries(formData.entries()),
          );
          if (!result.success)
            return {
              error: "Ungültige Anfrage",
              errorDetails: result.error,
              requestPayload: formData,
            };

          return await action(
            formData,
            authentication,
            result.data as z.infer<T>,
          );
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          throw error;
        } finally {
          span.end();
        }
      });
    } catch (error) {
      unstable_rethrow(error);
      void log.error("Internal Server Error", { error: serializeError(error) });
      return {
        error:
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        requestPayload: formData,
      };
    }
  };
};
