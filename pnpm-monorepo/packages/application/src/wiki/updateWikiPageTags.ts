import {
  AuditEventType,
  getEventContainerOfRow,
  MAXIMUM_WIKI_PAGE_TAGS,
  WIKI_TAG_NAME_MAXIMUM_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  rethrowRecordNotFound,
} from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { isWikiScopeFrozen, loadWikiScopeOfPage } from "./wikiScope.js";
import { findOrCreateWikiTags } from "./wikiTags.js";

/** The name of a tag: trimmed, with one space for each run of white space */
export const wikiTagNameSchema = z
  .string()
  .trim()
  .transform((value) => value.replaceAll(/\s+/g, " "))
  .pipe(z.string().min(1).max(WIKI_TAG_NAME_MAXIMUM_LENGTH));

export const updateWikiPageTagsInputSchema = z.object({
  page_id: idSchema,
  tag_names: z
    .array(wikiTagNameSchema)
    .max(MAXIMUM_WIKI_PAGE_TAGS)
    .describe("The complete set of tags. A missing tag is removed."),
});

export type UpdateWikiPageTagsInput = z.output<
  typeof updateWikiPageTagsInputSchema
>;

export interface UpdateWikiPageTagsOutput {
  readonly page_id: string;
  readonly added_tag_names: string[];
  readonly removed_tag_names: string[];
}

/**
 * Replaces the tags of a page with the submitted set. The tags are found or
 * created in the scope of the page (see `findOrCreateWikiTags()`), so a name
 * that differs only in letter case uses the existing tag. A tag whose last
 * assignment is removed here is deleted right away to keep the autocomplete
 * clean. Without a change, the output has empty lists and no audit event
 * exists: a different user or tab can have set the same tags before.
 *
 * @throws NotFoundError when a different user or tab deleted the page, or
 * when the actor cannot hold the scope of the page (the same answer as for a
 * page that is missing from the scope)
 * @throws ConflictError when the briefing of the page is over
 * @throws ForbiddenError when the actor cannot edit the page
 */
export const updateWikiPageTags = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateWikiPageTagsInput,
): Promise<UpdateWikiPageTagsOutput> =>
  withSpan(context, "updateWikiPageTags", async () => {
    const scope = await loadWikiScopeOfPage(context, actor, input.page_id);
    const page = scope?.pagesById.get(input.page_id);
    if (!scope || !page || page.deletedAt)
      throw new NotFoundError(WikiErrorMessage.PageNotFound);

    /**
     * The freeze would already deny through canEdit (the resolver strips it
     * on frozen events); the explicit check only gives the usual answer of
     * the events instead of a generic forbidden.
     */
    if (isWikiScopeFrozen(scope))
      throw new ConflictError(WikiErrorMessage.BriefingFrozen);
    if (!scope.permissions.get(page.id)?.canEdit)
      throw new ForbiddenError("The user cannot edit the page");

    const citizenId = actor.citizen?.id ?? null;

    const changes = await context.prisma.$transaction(async (transaction) => {
      const requestedTags = await findOrCreateWikiTags(
        transaction,
        input.tag_names,
        getEventContainerOfRow(page),
        citizenId,
      );
      const currentAssignments = await transaction.wikiPageTag.findMany({
        where: { pageId: page.id },
        select: { id: true, tagId: true, tag: { select: { name: true } } },
      });

      const requestedTagIds = new Set(requestedTags.map((tag) => tag.id));
      const currentTagIds = new Set(
        currentAssignments.map((assignment) => assignment.tagId),
      );
      const removedAssignments = currentAssignments.filter(
        (assignment) => !requestedTagIds.has(assignment.tagId),
      );
      const addedTags = requestedTags.filter(
        (tag) => !currentTagIds.has(tag.id),
      );
      if (removedAssignments.length === 0 && addedTags.length === 0)
        return null;

      await transaction.wikiPageTag.deleteMany({
        where: {
          id: { in: removedAssignments.map((assignment) => assignment.id) },
        },
      });
      await transaction.wikiPageTag.createMany({
        data: addedTags.map((tag) => ({
          pageId: page.id,
          tagId: tag.id,
          createdById: citizenId,
        })),
        skipDuplicates: true,
      });
      /**
       * Runs after the assignment delete above, so tags whose last usage was
       * just removed are swept immediately.
       */
      await transaction.wikiTag.deleteMany({
        where: {
          id: { in: removedAssignments.map((assignment) => assignment.tagId) },
          pages: { none: {} },
        },
      });
      /**
       * Denormalized copy of the tag names for the full-text search (see
       * WikiPage.tagsText).
       */
      await rethrowRecordNotFound(
        () =>
          transaction.wikiPage.update({
            where: { id: page.id },
            data: {
              tagsText: requestedTags
                .map((tag) => tag.name)
                .toSorted((first, second) => first.localeCompare(second))
                .join(" "),
              updatedById: citizenId,
            },
          }),
        WikiErrorMessage.PageNotFound,
      );

      return {
        addedTagNames: addedTags.map((tag) => tag.name),
        removedTagNames: removedAssignments.map(
          (assignment) => assignment.tag.name,
        ),
      };
    });

    if (changes)
      await context.audit.create([
        {
          type: AuditEventType.WIKI_PAGE_TAGS_UPDATED,
          data: {
            pageId: page.id,
            eventId: page.eventId ?? undefined,
            addedTagNames: changes.addedTagNames,
            removedTagNames: changes.removedTagNames,
          },
          createdById: actor.userId,
        },
      ]);

    return {
      page_id: page.id,
      added_tag_names: changes?.addedTagNames ?? [],
      removed_tag_names: changes?.removedTagNames ?? [],
    };
  });
