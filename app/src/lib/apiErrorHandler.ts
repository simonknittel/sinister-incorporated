import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { ZodError } from "zod";
import { log } from "./logging";

export default async function apiErrorHandler(
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
  } else if (error instanceof Error && error.message === "Not found") {
    return NextResponse.json(
      {
        message: "Not found",
      },
      { status: 404, ...responseInit },
    );
  } else if (
    (error instanceof Error && error.message === "Duplicate") ||
    (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
  ) {
    return NextResponse.json(
      {
        message: "Conflict",
      },
      { status: 409, ...responseInit },
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

  await log.error("errorHandler", {
    error: serializeError(error),
  });

  return NextResponse.json(
    {
      message: "Internal server error",
    },
    { status: 500, ...responseInit },
  );
}
