import {
  APP_KEY_PATTERN,
  AuditEventType,
  MAXIMUM_APP_KEY_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { AppErrorMessage } from "./appErrors.js";

export const toggleAppFavoriteInputSchema = z.object({
  app_key: z
    .string()
    .max(MAXIMUM_APP_KEY_LENGTH)
    .regex(APP_KEY_PATTERN)
    .describe("The namespaced key of the app, for example integrated:tasks."),
});

export type ToggleAppFavoriteInput = z.output<
  typeof toggleAppFavoriteInputSchema
>;

/**
 * The app catalog is host data: the host knows which apps the actor can see.
 */
export interface ToggleAppFavoriteOptions {
  /**
   * The keys of the apps that the actor can see. Resolving the key against
   * these keeps unknown and redacted apps from creating rows: a redacted app
   * has no key, so it never matches.
   */
  readonly visibleAppKeys: ReadonlySet<string>;
}

export interface ToggleAppFavoriteOutput {
  readonly app_key: string;
  /** The state after the toggle */
  readonly is_favorite: boolean;
}

/**
 * Adds the app to the favorites of the actor, or removes it when it is a
 * favorite already.
 *
 * @throws ForbiddenError for a user without a citizen
 * @throws NotFoundError when the actor cannot see the app
 */
export const toggleAppFavorite = (
  context: ApplicationContext,
  actor: Actor,
  input: ToggleAppFavoriteInput,
  options: ToggleAppFavoriteOptions,
): Promise<ToggleAppFavoriteOutput> =>
  withSpan(context, "toggleAppFavorite", async () => {
    const citizenId = requireCitizen(actor).id;

    if (!options.visibleAppKeys.has(input.app_key))
      throw new NotFoundError(AppErrorMessage.AppNotFound);

    const existingFavorite = await context.prisma.citizenAppFavorite.findUnique(
      {
        where: { citizenId_appKey: { citizenId, appKey: input.app_key } },
        select: { id: true },
      },
    );

    if (existingFavorite) {
      await context.prisma.citizenAppFavorite.delete({
        where: { id: existingFavorite.id },
      });
    } else {
      await context.prisma.citizenAppFavorite.create({
        data: { citizenId, appKey: input.app_key },
      });
    }

    await context.audit.create([
      {
        type: existingFavorite
          ? AuditEventType.APP_FAVORITE_REMOVED
          : AuditEventType.APP_FAVORITE_ADDED,
        data: { appKey: input.app_key, citizenId },
        createdById: actor.userId,
      },
    ]);

    return { app_key: input.app_key, is_favorite: !existingFavorite };
  });
