import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { log } from "../../../_lib/logging";

export default function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Invalid request params or body",
        errors: error.errors,
      },
      { status: 400 },
    );
  } else if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 },
    );
  } else if (error instanceof Error && error.message === "Not Found") {
    return NextResponse.json(
      {
        message: "Not Found",
      },
      { status: 404 },
    );
  } else if (
    error instanceof Error &&
    ["Bad request", "Unexpected end of JSON input"].includes(error.message)
  ) {
    return NextResponse.json(
      {
        message: "Bad request",
      },
      { status: 400 },
    );
  }

  log.error("errorHandler", {
    error: serializeError(error),
  });

  return NextResponse.json(
    {
      message: "Internal server error",
    },
    { status: 500 },
  );
}
