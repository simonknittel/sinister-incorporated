import { env } from "~/env.mjs";
import { logToAxiom } from "./axiom";
import { logToConsole } from "./console";
import { logToLoki } from "./logToLoki";
import { type LogEntry } from "./types";

const info = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date(),
    level: "info",
    message,
    host: env.NEXTAUTH_URL,
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
  logToLoki(logEntry);
};

const warn = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date(),
    level: "warn",
    message,
    host: env.NEXTAUTH_URL,
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
  logToLoki(logEntry);
};

const error = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date(),
    level: "error",
    message,
    host: env.NEXTAUTH_URL,
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
