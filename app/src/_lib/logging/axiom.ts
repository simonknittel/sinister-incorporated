import { env } from "process";
import { logToConsole } from "./console";
import { type LogOutput } from "./types";

export const logToAxiom: LogOutput = (logEntry) => {
  // TODO: Debounce this to avoid spamming Axiom

  if (env.AXIOM_API_TOKEN) {
    fetch("https://api.axiom.co/v1/datasets/sinister-incorporated/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.AXIOM_API_TOKEN}`,
      },
      body: JSON.stringify([
        {
          _time: logEntry.timestamp,
          ...logEntry,
        },
      ]),
    })
      .then((res) => {
        if (res.ok) return;

        logToConsole({
          timestamp: new Date().toISOString(),
          level: "error",
          message: "Error posting to Axiom",
          responseBody: res.body,
        });
      })
      .catch((err) => {
        logToConsole({
          timestamp: new Date().toISOString(),
          level: "error",
          message: "Error posting to Axiom",
          error: err,
        });
      });
  }
};
