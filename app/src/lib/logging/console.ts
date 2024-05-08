import { env } from "process";
import { type LogOutput } from "./types";

export const logToConsole: LogOutput = (logEntry) => {
  const { timestamp, ...rest } = logEntry;

  switch (logEntry.level) {
    case "info":
      if (env.NODE_ENV === "development") {
        console.info({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      } else {
        console.info(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      }
      break;

    case "warn":
      if (env.NODE_ENV === "development") {
        console.warn({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      } else {
        console.warn(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      }
      break;

    case "error":
      if (env.NODE_ENV === "development") {
        console.error({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      } else {
        console.error(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      }
      break;
  }
};
