import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { log } from "./logging";
import { CustomError } from "./logging/CustomError";

export const errorHandler = (error: unknown) => {
	if (error instanceof ZodError) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Bad request",
				errors: error.errors,
			}),
		};
	}

	if (error instanceof Error && error.message === "Bad request") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Bad request",
			}),
		};
	}

	if (error instanceof Error && error.message === "Unauthorized") {
		return {
			statusCode: 401,
			body: JSON.stringify({
				message: "Unauthorized",
			}),
		};
	}

	if (error instanceof CustomError) {
		log.error(error.message, serializeError(error.context));

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Internal server error",
			}),
		};
	}

	log.error("errorHandler", {
		error: serializeError(error),
	});

	return {
		statusCode: 500,
		body: JSON.stringify({
			message: "Internal server error",
		}),
	};
};
