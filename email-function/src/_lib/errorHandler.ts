import { ZodError } from "zod";
import { log } from "./logging";

export default function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Bad request",
        errors: error.errors,
      }),
    };
  } else if (error instanceof Error && error.message === "Bad request") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Bad request",
      }),
    };
  }

  log.error("errorHandler", {
    error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
  });

  return {
    statusCode: 500,
    body: {
      message: "Internal server error",
    },
  };
}
