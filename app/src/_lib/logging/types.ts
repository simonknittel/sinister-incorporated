export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  [key: string]: unknown;
}

export type LogOutput = (logEntry: LogEntry) => void;
