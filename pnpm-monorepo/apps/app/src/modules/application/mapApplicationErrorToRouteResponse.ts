import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@sam-monorepo/application";
import { NextResponse } from "next/server";

/** The response of a route handler to a `NotFoundError` */
export enum RouteNotFoundResponse {
  /** 404 "Not Found" */
  NotFound = "not_found",
  /**
   * 400 "Bad Request": for a route that refuses a missing target as a bad
   * request
   */
  BadRequest = "bad_request",
}

interface Options {
  readonly notFound?: RouteNotFoundResponse;
}

const respond = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

const respondToNotFound = (notFound: RouteNotFoundResponse) => {
  switch (notFound) {
    case RouteNotFoundResponse.NotFound:
      return respond("Not Found", 404);

    case RouteNotFoundResponse.BadRequest:
      return respond("Bad Request", 400);

    default:
      throw new Error(
        `Unknown not-found response: ${notFound satisfies never}`,
      );
  }
};

/**
 * Maps a typed error of a use case to the response of a route handler, with
 * the status codes and the `{ error }` bodies of the routes. Rethrows all
 * other errors, thus the route gives them to `apiErrorHandler()`. Use it only
 * in a route handler.
 */
export const mapApplicationErrorToRouteResponse = (
  error: unknown,
  { notFound = RouteNotFoundResponse.NotFound }: Options = {},
) => {
  if (error instanceof ForbiddenError) return respond("Forbidden", 403);
  if (error instanceof NotFoundError) return respondToNotFound(notFound);
  if (error instanceof ValidationError) return respond("Bad Request", 400);
  if (error instanceof ConflictError) return respond("Conflict", 409);

  throw error;
};
