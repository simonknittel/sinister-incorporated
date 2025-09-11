import { env } from "@/env";
import { serializeError } from "serialize-error";
import { logToConsole } from "./console";
import { type LogOutput } from "./types";

export const logToLoki: LogOutput = async (logEntry) => {
  if (!env.LOKI_HOST) return;

  // TODO: Debounce this to avoid spamming

  const basicAuth = Buffer.from(
    env.LOKI_AUTH_USER + ":" + env.LOKI_AUTH_PASSWORD,
  ).toString("base64");

  const body = JSON.stringify({
    streams: [
      {
        stream: {
          host: logEntry.host,
        },
        values: [
          [
            (new Date(logEntry.timestamp).getTime() * 1_000_000).toString(),
            JSON.stringify(logEntry),
          ],
        ],
      },
    ],
  });

  try {
    const res = await fetch(`${env.LOKI_HOST}/loki/api/v1/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body,
    });

    if (res.ok) return;

    void logToConsole({
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Error posting to Loki",
      responseBody: await res.text(),
      responseStatus: res.status,
      host: env.NEXTAUTH_URL,
      stack: new Error().stack,
      ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
    });
  } catch (error) {
    void logToConsole({
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Error posting to Loki",
      error: JSON.stringify(serializeError(error)),
      host: env.NEXTAUTH_URL,
      stack: new Error().stack,
      ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
    });
  }
};
