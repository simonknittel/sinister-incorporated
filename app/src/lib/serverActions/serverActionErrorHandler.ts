import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { log } from "../logging";
import { type ServerActionResponse } from "./types";

export default function serverActionErrorHandler(
  error: unknown,
): ServerActionResponse {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Es wurde eine ungültige Anfrage gestellt.",
    };
  } else if (error instanceof Error && error.message === "Unauthenticated") {
    return {
      status: 401,
      message: "Zum Speichern musst du angemeldet sein.",
    };
  } else if (error instanceof Error && error.message === "Unauthorized") {
    return {
      status: 403,
      message: "Du bist nicht berechtigt, diese Aktion auszuführen.",
    };
  } else if (error instanceof Error && error.message === "Not found") {
    return {
      status: 404,
      message: "Der Eintrag konnte nicht gefunden werden.",
    };
  } else if (
    (error instanceof Error && error.message === "Duplicate") ||
    (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
  ) {
    return {
      status: 409,
      message: "Dieser Eintrag existiert bereits.",
    };
  } else if (
    error instanceof Error &&
    ["Bad request", "Unexpected end of JSON input"].includes(error.message)
  ) {
    return {
      status: 400,
      message: "Es wurde eine ungültige Anfrage gestellt.",
    };
  }

  log.error("errorHandler", {
    error: serializeError(error),
  });

  return {
    status: 500,
    message: "Beim Speichern ist ein unerwarteter Fehler aufgetreten.",
  };
}
