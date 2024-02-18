import { logToConsole } from "./console";
import { type LogEntry } from "./types";

const info = (message: string, args: Record<string, unknown> = {}) => {
	const logEntry: LogEntry = {
		timestamp: new Date(),
		level: "info",
		message,
		...args,
	};

	if (process.env.COMMIT_SHA) logEntry.commitSha = process.env.COMMIT_SHA;

	logToConsole(logEntry);
};

const warn = (message: string, args: Record<string, unknown> = {}) => {
	const logEntry: LogEntry = {
		timestamp: new Date(),
		level: "warn",
		message,
		...args,
	};

	if (process.env.COMMIT_SHA) logEntry.commitSha = process.env.COMMIT_SHA;

	logToConsole(logEntry);
};

const error = (message: string, args: Record<string, unknown> = {}) => {
	const logEntry: LogEntry = {
		timestamp: new Date(),
		level: "error",
		message,
		...args,
	};

	if (process.env.COMMIT_SHA) logEntry.commitSha = process.env.COMMIT_SHA;

	logToConsole(logEntry);
};

export const log = {
	info,
	warn,
	error,
};
