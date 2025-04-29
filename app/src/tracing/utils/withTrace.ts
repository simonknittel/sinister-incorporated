/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpanStatusCode } from "@opentelemetry/api";
import { getTracer } from "./getTracer";

export const withTrace = <T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
) => {
  return (...args: Parameters<T>) => {
    return getTracer().startActiveSpan(name, async (span) => {
      try {
        return (await fn(...args)) as Promise<ReturnType<T>>;
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
};
