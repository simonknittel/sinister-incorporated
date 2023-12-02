export interface LogEntry {
  timestamp: Date;
  level: "info" | "warn" | "error";
  message: string;
  commitSha?: string;
  [key: string]: unknown;
}

export type LogOutput = (logEntry: LogEntry) => void;
