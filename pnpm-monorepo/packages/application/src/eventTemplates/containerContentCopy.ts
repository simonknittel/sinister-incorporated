import type { Prisma } from "@sam-monorepo/database/client";
import {
  buildPositionTree,
  eventContainerColumns,
  type EventContainer,
  type EventContainerColumns,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import {
  clonePositions,
  findClonablePositions,
} from "../lineup/lineupClone.js";
import {
  copyBriefingTree,
  findBriefingCopySource,
} from "../wiki/briefingCopy.js";

/**
 * The timeout of an interactive transaction that writes many rows one after
 * the other: the copy of a lineup with its briefing (the same bound as the
 * wiki copy), or a new order of a lineup. The default of Prisma (5 seconds)
 * is possibly too short for this (an assumption, not measured).
 */
export const LONG_TRANSACTION_TIMEOUT_IN_MILLISECONDS = 30_000;

/**
 * The lineup and the briefing of an event or of an event template that a copy
 * takes. No permission check: the caller checks the container.
 */
export const loadContainerCopySource = async (
  context: Pick<ApplicationContext, "prisma">,
  columns: EventContainerColumns,
) => {
  const [positions, briefing] = await Promise.all([
    findClonablePositions(context, columns),
    findBriefingCopySource(context, columns),
  ]);

  return {
    positionTree: buildPositionTree(positions),
    briefingPages: briefing.pages,
    /** Null when the root page was trashed: then there is no briefing */
    rootPage: briefing.rootPage,
  };
};

type ContainerCopySource = Awaited<ReturnType<typeof loadContainerCopySource>>;

/**
 * Copies the lineup and the briefing pages of the source into the target
 * container, on the transaction of the caller. The lineup goes first, so that
 * the POSITION scopes of the pages can be remapped onto the new positions.
 * Without briefing pages, only the lineup is copied.
 */
export const copyContainerContent = async (
  transaction: Prisma.TransactionClient,
  source: Pick<ContainerCopySource, "positionTree" | "briefingPages">,
  targetContainer: EventContainer,
  citizenId: string,
) => {
  const positionIdBySourceId = await clonePositions(
    transaction,
    source.positionTree,
    {
      columns: eventContainerColumns(targetContainer),
      parentPositionId: null,
      startOrder: 0,
    },
  );

  const { pageCount } =
    source.briefingPages.length > 0
      ? await copyBriefingTree(transaction, {
          sourcePages: source.briefingPages,
          targetContainer,
          createdByEntityId: citizenId,
          positionIdBySourceId,
        })
      : { pageCount: 0 };

  return { positionCount: positionIdBySourceId.size, pageCount };
};
