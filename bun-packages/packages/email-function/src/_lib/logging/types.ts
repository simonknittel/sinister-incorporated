export interface LogEntry {
	timestamp: string;
	level: "info" | "warn" | "error";
	message: string;
	commitSha?: string;
	[key: string]: string | number | boolean | undefined;
}

export type LogOutput = (logEntry: LogEntry) => void;
