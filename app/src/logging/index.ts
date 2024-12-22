import { env } from "@/env.mjs";
import { logToConsole } from "./console";
import { logToLoki } from "./loki";
import { type LogEntry } from "./types";

const info = async (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    ...args,
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
  };

  await Promise.all([logToConsole(logEntry), logToLoki(logEntry)]);
};

const warn = async (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    ...args,
    timestamp: new Date().toISOString(),
    level: "warn",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
  };

  await Promise.all([logToConsole(logEntry), logToLoki(logEntry)]);
};

const error = async (message: string, args: Record<string, unknown> = {}) => {
  const logEntry: LogEntry = {
    ...args,
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    host: env.HOST,
    stack: new Error().stack,
    ...(env.COMMIT_SHA && { commitSha: env.COMMIT_SHA }),
  };

  await Promise.all([logToConsole(logEntry), logToLoki(logEntry)]);
};

export const log = {
  info,
  warn,
  error,
};
