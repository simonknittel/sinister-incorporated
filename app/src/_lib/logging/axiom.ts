import { env } from "process";
import { logToConsole } from "./console";
import { type LogOutput } from "./types";

export const logToAxiom: LogOutput = (logEntry) => {
  if (!env.AXIOM_API_TOKEN) return;

  // TODO: Debounce this to avoid spamming

  const { timestamp, ...rest } = logEntry;

  fetch("https://api.axiom.co/v1/datasets/sinister-incorporated/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AXIOM_API_TOKEN}`,
    },
    body: JSON.stringify([
      {
        _time: logEntry.timestamp.toISOString(),
        ...{
          timestamp: timestamp.toISOString(),
          ...rest,
        },
      },
    ]),
  })
    .then(async (res) => {
      if (res.ok) return;

      logToConsole({
        timestamp: new Date(),
        level: "error",
        message: "Error posting to Axiom",
        responseBody: await res.text(),
        responseStatus: res.status,
        host: env.NEXTAUTH_URL!,
        ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
      });
    })
    .catch((err) => {
      logToConsole({
        timestamp: new Date(),
        level: "error",
        message: "Error posting to Axiom",
        error: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        host: env.NEXTAUTH_URL!,
        ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
      });
    });
};
