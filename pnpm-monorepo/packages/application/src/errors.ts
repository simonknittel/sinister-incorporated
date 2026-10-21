/**
 * The typed errors of the use cases. Each app maps them to its own response:
 * the Next.js app to a translated text, the MCP server to a tool error. The
 * messages are short English texts for the logs and for the MCP clients.
 */
import { isPrismaError, PrismaErrorCode } from "@sam-monorepo/database/client";

/** The actor does not have the permission for the operation */
export class ForbiddenError extends Error {
  override readonly name = "ForbiddenError";

  constructor(message = "Forbidden", options?: ErrorOptions) {
    super(message, options);
  }
}

/** The target of the operation does not exist, or the actor cannot see it */
export class NotFoundError extends Error {
  override readonly name = "NotFoundError";

  constructor(message = "Not found", options?: ErrorOptions) {
    super(message, options);
  }
}

/**
 * The target is in a state that does not permit the operation, for example
 * an event that already ended
 */
export class ConflictError extends Error {
  override readonly name = "ConflictError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** The input is valid for the schema, but not for the current data */
export class ValidationError extends Error {
  override readonly name = "ValidationError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/**
 * Runs a write of Prisma. A write fails with P2025 when its record, or a
 * record that it connects, is gone, for example after a delete between the
 * read and the write: then the function throws a `NotFoundError` with the
 * message. It throws all other errors again.
 */
export const rethrowRecordNotFound = async <Result>(
  write: () => Promise<Result>,
  message: string,
): Promise<Result> => {
  try {
    return await write();
  } catch (error) {
    if (isPrismaError(error, PrismaErrorCode.RecordNotFound))
      throw new NotFoundError(message, { cause: error });

    throw error;
  }
};

/**
 * Runs a write of Prisma. A write fails with P2002 when a different record
 * already has the value of a unique column, for example a name that must be
 * unique: then the function throws a `ValidationError` with the message. It
 * throws all other errors again.
 */
export const rethrowUniqueConstraintFailed = async <Result>(
  write: () => Promise<Result>,
  message: string,
): Promise<Result> => {
  try {
    return await write();
  } catch (error) {
    if (isPrismaError(error, PrismaErrorCode.UniqueConstraintFailed))
      throw new ValidationError(message, { cause: error });

    throw error;
  }
};
