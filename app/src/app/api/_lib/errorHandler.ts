import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { log } from "../../../lib/logging";

export default function errorHandler(
  error: unknown,
  responseInit: ResponseInit = {},
) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Invalid request params or body",
        errors: error.errors,
      },
      { status: 400, ...responseInit },
    );
  } else if (error instanceof Error && error.message === "Unauthenticated") {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401, ...responseInit },
    );
  } else if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json(
      {
        message: "Forbidden",
      },
      { status: 403, ...responseInit },
    );
  } else if (error instanceof Error && error.message === "Not Found") {
    return NextResponse.json(
      {
        message: "Not Found",
      },
      { status: 404, ...responseInit },
    );
  } else if (
    error instanceof Error &&
    ["Bad request", "Unexpected end of JSON input"].includes(error.message)
  ) {
    return NextResponse.json(
      {
        message: "Bad request",
      },
      { status: 400, ...responseInit },
    );
  }

  log.error("errorHandler", {
    error: serializeError(error),
  });

  return NextResponse.json(
    {
      message: "Internal server error",
    },
    { status: 500, ...responseInit },
  );
}
