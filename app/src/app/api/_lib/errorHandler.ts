import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
  } else if (error instanceof Error && error.message === "Bad request") {
    return NextResponse.json(
      {
        message: "Bad request",
      },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      message: "Internal server error",
    },
    { status: 500 },
  );
}
