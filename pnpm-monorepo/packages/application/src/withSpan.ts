import { SpanStatusCode, type Span } from "@opentelemetry/api";
import type { ApplicationContext } from "./context.js";

/**
 * Runs the function in an active span. A thrown error sets the error status
 * of the span and goes to the caller.
 */
export const withSpan = <Result>(
  context: Pick<ApplicationContext, "tracer">,
  name: string,
  fn: (span: Span) => Promise<Result>,
): Promise<Result> =>
  context.tracer.startActiveSpan(name, async (span) => {
    try {
      return await fn(span);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
