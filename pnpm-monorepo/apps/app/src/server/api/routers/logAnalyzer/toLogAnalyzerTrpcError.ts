import {
  ForbiddenError,
  LogAnalyzerErrorMessage,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import { toTrpcError } from "../../trpc";

/** The text of the 403 for a message of the error. */
const FORBIDDEN_MESSAGES: Readonly<Partial<Record<string, string>>> = {
  [LogAnalyzerErrorMessage.SharingDisabled]: "Log analyzer sharing is disabled",
};

/**
 * Maps the refusals of the log analyzer helpers to the TRPCErrors that the
 * client reads (a 403 for both), and any other error to the opaque internal
 * server error.
 */
export const toLogAnalyzerTrpcError = (error: unknown, message: string) => {
  if (error instanceof ForbiddenError)
    return new TRPCError({
      code: "FORBIDDEN",
      message:
        FORBIDDEN_MESSAGES[error.message] ?? "Missing log analyzer permission",
    });

  return toTrpcError(error, message);
};
