import { env } from "@/env";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { beamsClient } from "./beamsClient";

export const publishNotification = async (
  interests: string[],
  title: string,
  body: string,
  deep_link: string,
) => {
  return getTracer().startActiveSpan("publishNotification", async (span) => {
    try {
      if (!beamsClient) return;

      await beamsClient.publishToInterests(interests, {
        web: {
          notification: {
            title: `${title} | Sinister Incorporated`,
            body,
            deep_link: `${env.BASE_URL}${deep_link}`,
            icon: `${env.BASE_URL}/logo-white-on-black.png`,
          },
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
};
