import type { ActionResponse } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

/**
 * The texts of the app for the messages of the typed errors, by message. The
 * use cases write the messages in English and take them from an enum of
 * their group (for example `EventErrorMessage`).
 */
export type ApplicationErrorTexts = Readonly<Partial<Record<string, string>>>;

interface Options {
  readonly formData: FormData;
  readonly t: Awaited<ReturnType<typeof getTranslations>>;
  /**
   * The texts of the messages that the action can get. A message without a
   * text gets the common text of its error class, a conflict its English
   * message.
   */
  readonly texts?: ApplicationErrorTexts;
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
  { formData, t, texts = {} }: Options,
): ActionResponse => {
  if (error instanceof ForbiddenError)
    return {
      error: texts[error.message] ?? t("Common.forbidden"),
      requestPayload: formData,
    };

  if (error instanceof NotFoundError)
    return rejectConflict(
      texts[error.message] ?? t("Common.notFound"),
      formData,
    );

  if (error instanceof ConflictError)
    return rejectConflict(texts[error.message] ?? error.message, formData);

  if (error instanceof ValidationError)
    return {
      error: texts[error.message] ?? t("Common.badRequest"),
      requestPayload: formData,
    };

  throw error;
};
