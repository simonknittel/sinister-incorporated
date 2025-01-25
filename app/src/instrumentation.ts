import { registerOTel } from "@vercel/otel";
import { env } from "./env";

export const register = () => {
  if (env.ENABLE_INSTRUMENTATION !== "true") return;
  if (!env.OTEL_EXPORTER_OTLP_PROTOCOL || !env.OTEL_EXPORTER_OTLP_ENDPOINT)
    return;
  registerOTel({ serviceName: "sam" });
};
