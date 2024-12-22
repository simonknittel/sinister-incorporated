import { log } from "@/logging";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { type ServerActionResponse } from "./types";

export const serverActionErrorHandler = (
  error: unknown,
  options?: {
    errorMessages?: {
      400?: string;
      401?: string;
      403?: string;
      404?: string;
      409?: string;
      500?: string;
    };
  },
): ServerActionResponse => {
  if (
    error instanceof ZodError ||
    (error instanceof Error &&
      ["Bad request", "Unexpected end of JSON input"].includes(error.message))
  ) {
    return {
      status: 400,
      errorMessage: options?.errorMessages?.[400] || "Bad request",
      error: JSON.stringify(error),
    };
  } else if (error instanceof Error && error.message === "Unauthenticated") {
    return {
      status: 401,
      errorMessage: options?.errorMessages?.[401] || "Unauthenticated",
    };
  } else if (error instanceof Error && error.message === "Unauthorized") {
    return {
      status: 403,
      errorMessage: options?.errorMessages?.[403] || "Unauthorized",
    };
  } else if (error instanceof Error && error.message === "Not found") {
    return {
      status: 404,
      errorMessage: options?.errorMessages?.[404] || "Not found",
    };
  } else if (
    (error instanceof Error && error.message === "Duplicate") ||
    (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
  ) {
    return {
      status: 409,
      errorMessage: options?.errorMessages?.[409] || "Conflict",
    };
  }

  void log.error("errorHandler", {
    error: serializeError(error),
  });

  return {
    status: 500,
    errorMessage: options?.errorMessages?.[500] || "Internal server error",
  };
};
