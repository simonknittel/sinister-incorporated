import { env } from "../../env.mjs";
import { logToAxiom } from "./axiom";
import { logToConsole } from "./console";
import { logToLoki } from "./loki";
import { type LogEntry } from "./types";

const info = (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
  logToLoki(logEntry);
};

const warn = (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "warn",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
  logToLoki(logEntry);
};

const error = (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
  logToLoki(logEntry);
};

export const log = {
  info,
  warn,
  error,
};
