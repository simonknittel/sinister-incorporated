import { env } from "process";
import { type LogOutput } from "./types";

export const logToConsole: LogOutput = (logEntry) => {
  const { timestamp, ...rest } = logEntry;

  switch (logEntry.level) {
    case "info":
      if (env.NODE_ENV === "production") {
        console.info(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      } else {
        console.info({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      }
      break;

    case "warn":
      if (env.NODE_ENV === "production") {
        console.warn(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      } else {
        console.warn({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      }
      break;

    case "error":
      if (env.NODE_ENV === "production") {
        console.error(
          JSON.stringify({
            timestamp: timestamp.toISOString(),
            ...rest,
          }),
        );
      } else {
        console.error({
          timestamp: timestamp.toISOString(),
          ...rest,
        });
      }
      break;
  }
};
