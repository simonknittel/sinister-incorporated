import { logToAxiom } from "./axiom";
import { logToConsole } from "./console";
import { type LogEntry } from "./types";

const info = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    ...args,
  };

  logToConsole(logEntry);
  logToAxiom(logEntry);
};

const warn = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "warn",
    message,
    ...args,
  };

  logToConsole(logEntry);
};

const error = (message: string, args: Record<string, unknown>) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    ...args,
  };

  logToConsole(logEntry);
};

export const log = {
  info,
  warn,
  error,
};
