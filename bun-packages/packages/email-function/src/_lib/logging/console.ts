import { type LogOutput } from "./types";

export const logToConsole: LogOutput = (logEntry) => {
	const { timestamp, ...rest } = logEntry;

	switch (logEntry.level) {
		case "info":
			console.info(
				JSON.stringify({
					timestamp: timestamp.toISOString(),
					...rest,
				}),
			);
			break;
		case "warn":
			console.warn(
				JSON.stringify({
					timestamp: timestamp.toISOString(),
					...rest,
				}),
			);
			break;
		case "error":
			console.error(
				JSON.stringify({
					timestamp: timestamp.toISOString(),
					...rest,
				}),
			);
			break;
	}
};
