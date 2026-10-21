import {
  createAuthenticatedAction,
  type ActionGate,
  type Translations,
} from "@/modules/actions/utils/createAction";
import type { Actor, ApplicationContext } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import type * as z from "zod";
import { getApplicationContext } from "./getApplicationContext";
import {
  mapApplicationErrorToActionResponse,
  type ApplicationErrorTexts,
} from "./mapApplicationErrorToActionResponse";
import { toActor } from "./toActor";

/** Whether the page shows the new state after a successful use case */
export enum ActionRefresh {
  Always = "always",
  Never = "never",
}

export interface UseCaseActionDefinition<Schema extends z.ZodTypeAny, Output> {
  /** The name of the action in the traces and in the logs */
  readonly name: string;
  readonly schema: Schema;
  readonly useCase: (
    context: ApplicationContext,
    actor: Actor,
    input: z.output<Schema>,
  ) => Promise<Output>;
  /** See `createAuthenticatedAction()` */
  readonly parseFormData?: (formData: FormData) => unknown;
  /** `ActionGate.Clearance` by default */
  readonly gate?: ActionGate;
  /** A record, or a function of `t` for the texts that use a common text */
  readonly texts?:
    ApplicationErrorTexts | ((t: Translations) => ApplicationErrorTexts);
  /** `ActionRefresh.Always` by default */
  readonly refresh?: ActionRefresh;
  readonly success: (t: Translations, output: Output) => string;
  /**
   * For example `t("Common.notificationsFailed")` when `notifications_sent`
   * is false
   */
  readonly warning?: (t: Translations, output: Output) => string | undefined;
}

/**
 * A server action that runs one use case for the user of the session: the
 * standard shape of the thin action wrappers. An action that does more (a
 * redirect, a cookie, an app-only option, a refresh on a condition) calls
 * `createAuthenticatedAction()` itself.
 */
export const createUseCaseAction = <Schema extends z.ZodTypeAny, Output>(
  definition: UseCaseActionDefinition<Schema, Output>,
) =>
  createAuthenticatedAction(
    definition.name,
    definition.schema,
    async (formData, authentication, data, t) => {
      let output: Output;
      try {
        output = await definition.useCase(
          getApplicationContext(),
          await toActor(authentication.session),
          data,
        );
      } catch (error) {
        return mapApplicationErrorToActionResponse(error, {
          formData,
          t,
          texts:
            typeof definition.texts === "function"
              ? definition.texts(t)
              : definition.texts,
        });
      }

      if (definition.refresh !== ActionRefresh.Never) refresh();

      const warning = definition.warning?.(t, output);

      return {
        success: definition.success(t, output),
        ...(warning === undefined ? {} : { warning }),
      };
    },
    { parseFormData: definition.parseFormData, gate: definition.gate },
  );
