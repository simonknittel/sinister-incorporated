import { isPrismaError, PrismaErrorCode } from "@sam-monorepo/database/client";
import { NotFoundError } from "../errors.js";
import { RoleErrorMessage } from "./roleErrors.js";

/**
 * Runs the update of a role. The update fails with P2025 when the role, or
 * a role that the update connects, is gone: then the function throws a
 * `NotFoundError`.
 */
export const updateExistingRole = async <Result>(
  update: () => Promise<Result>,
): Promise<Result> => {
  try {
    return await update();
  } catch (error) {
    if (isPrismaError(error, PrismaErrorCode.RecordNotFound))
      throw new NotFoundError(RoleErrorMessage.NotFound, { cause: error });

    throw error;
  }
};
