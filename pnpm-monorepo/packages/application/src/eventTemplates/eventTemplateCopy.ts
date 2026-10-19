import type {
  EventDiscordPublishTarget,
  EventVisibility,
} from "@sam-monorepo/database/client";
import {
  buildBriefingRootPageSeed,
  buildPositionTree,
  eventContainerColumns,
  toTemplateContainer,
  type EventContainerColumns,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import {
  clonePositions,
  findClonablePositions,
} from "../lineup/lineupClone.js";
import {
  COPYABLE_UPLOAD_SELECT,
  copyUploadInTransaction,
} from "../uploads/uploadCopy.js";
import {
  copyBriefingTree,
  findBriefingCopySource,
} from "../wiki/briefingCopy.js";

/** The briefing copy dominates the runtime — same bound the wiki copy uses */
const TRANSACTION_TIMEOUT_MILLISECONDS = 30_000;

/** The fields of the new template */
export interface EventTemplateCopyFields {
  readonly name: string;
  readonly description: string | null;
  readonly visibility: EventVisibility;
  readonly visibilityRoleIds: readonly string[];
  readonly discordPublishTarget: EventDiscordPublishTarget | null;
  readonly discordPublishChannelId: string | null;
  readonly discordPublishLocation: string | null;
}

export interface EventTemplateCopySource {
  /** The event or the template whose lineup, briefing and cover the copy takes */
  readonly columns: EventContainerColumns;
  readonly coverImageId: string | null;
  /**
   * True when the copy of a source without a briefing root page gets the
   * empty root page, like a new template. False copies the pages of the
   * source without a root (see the known defect of the duplicate).
   */
  readonly seedsMissingBriefingRoot: boolean;
}

export interface EventTemplateCopyResult {
  readonly template: { readonly id: string; readonly name: string };
  readonly positionCount: number;
  readonly pageCount: number;
}

/**
 * Creates a personal template of the citizen from an event or from a
 * template: the fields, the cover, the lineup and the briefing carry over.
 * No permission check: the caller checks the source.
 */
export const createEventTemplateCopy = async (
  context: ApplicationContext,
  citizenId: string,
  source: EventTemplateCopySource,
  fields: EventTemplateCopyFields,
): Promise<EventTemplateCopyResult> => {
  const [sourcePositions, sourceBriefing, sourceCover] = await Promise.all([
    findClonablePositions(context.prisma, source.columns),
    findBriefingCopySource(context.prisma, source.columns),
    source.coverImageId
      ? context.prisma.upload.findUnique({
          where: { id: source.coverImageId },
          select: COPYABLE_UPLOAD_SELECT,
        })
      : null,
  ]);

  /**
   * Keyed on the root page, like the creation of an event: an event
   * predating the briefing feature has pages to copy but no root, and a
   * template without a root page has no briefing and no way back to one.
   */
  const copiesBriefing =
    !source.seedsMissingBriefingRoot || sourceBriefing.rootPage !== null;

  return context.prisma.$transaction(
    async (transaction) => {
      /**
       * The template gets its own cover object, so editing or deleting one
       * never touches the other.
       */
      const coverImage = sourceCover
        ? await copyUploadInTransaction(
            context,
            transaction,
            sourceCover,
            citizenId,
          )
        : null;

      const template = await transaction.eventTemplate.create({
        data: {
          name: fields.name,
          description: fields.description,
          coverImageId: coverImage?.id ?? null,
          visibility: fields.visibility,
          visibilityRoles: {
            create: fields.visibilityRoleIds.map((roleId) => ({ roleId })),
          },
          discordPublishTarget: fields.discordPublishTarget,
          discordPublishChannelId: fields.discordPublishChannelId,
          discordPublishLocation: fields.discordPublishLocation,
          createdById: citizenId,
          updatedById: citizenId,
          ownedById: citizenId,
          ...(copiesBriefing
            ? {}
            : { wikiPages: { create: buildBriefingRootPageSeed(citizenId) } }),
        },
        select: { id: true, name: true },
      });

      const targetContainer = toTemplateContainer(template.id);

      const positionIdBySourceId = await clonePositions(
        transaction,
        buildPositionTree(sourcePositions),
        {
          columns: eventContainerColumns(targetContainer),
          parentPositionId: null,
          startOrder: 0,
        },
      );

      /**
       * Copied after the lineup, so the pages' POSITION scopes can be
       * remapped onto the template's own positions.
       */
      const briefing = copiesBriefing
        ? await copyBriefingTree(transaction, {
            sourcePages: sourceBriefing.pages,
            targetContainer,
            createdByEntityId: citizenId,
            positionIdBySourceId,
          })
        : { pageCount: 0 };

      return {
        template,
        positionCount: positionIdBySourceId.size,
        pageCount: briefing.pageCount,
      };
    },
    { timeout: TRANSACTION_TIMEOUT_MILLISECONDS },
  );
};
