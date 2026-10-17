import type { ActionResponse } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

interface Options {
  readonly formData: FormData;
  readonly t: Awaited<ReturnType<typeof getTranslations>>;
  /**
   * The use cases write the message of a conflict in English for the MCP
   * clients. Give the translated text for the conflicts of the action.
   * Without it, the response shows the English message.
   */
  readonly conflictMessage?: (error: ConflictError) => string;
}

/**
 * Maps a typed error of a use case to the response of a server action. Use it
 * only in a server action: a conflict and a missing target refresh the page,
 * like the other guards of the actions. Rethrows all other errors, thus
 * `createAuthenticatedAction` logs them and responds with its internal server
 * error.
 */
export const mapApplicationErrorToActionResponse = (
  error: unknown,
  { formData, t, conflictMessage }: Options,
): ActionResponse => {
  if (error instanceof ForbiddenError)
    return { error: t("Common.forbidden"), requestPayload: formData };

  if (error instanceof NotFoundError)
    return rejectConflict(t("Common.notFound"), formData);

  if (error instanceof ConflictError)
    return rejectConflict(conflictMessage?.(error) ?? error.message, formData);

  if (error instanceof ValidationError)
    return { error: t("Common.badRequest"), requestPayload: formData };

  throw error;
};
