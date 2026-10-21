import { getCitizenDisplayName } from "@sam-monorepo/domain";
import { CITIZEN_REFERENCE_SELECT } from "../../citizenReference.js";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";

export interface FindWikiCitizenMentionedRecipientInput {
  readonly mentionId: string;
}

export interface WikiCitizenMentionedRecipients {
  readonly mention: {
    readonly pageId: string;
    readonly pageTitle: string;
    readonly eventId: string | null;
    /** The display name, also the label of a deleted citizen */
    readonly mentionedByName: string | null;
  };
  readonly recipients: Recipient[];
}

/**
 * The mentioned citizen of one pending mention link. The wiki mention
 * automation has already done the read check of the mention. Null when the
 * mention was removed in the meantime or its page is in the trash.
 */
export const findWikiCitizenMentionedRecipient = async (
  context: ApplicationContext,
  input: FindWikiCitizenMentionedRecipientInput,
): Promise<WikiCitizenMentionedRecipients | null> => {
  const mention = await context.prisma.wikiPageCitizenMention.findUnique({
    where: { id: input.mentionId },
    select: {
      citizenId: true,
      createdBy: { select: CITIZEN_REFERENCE_SELECT },
      page: {
        select: { id: true, title: true, eventId: true, deletedAt: true },
      },
    },
  });
  if (!mention || mention.page.deletedAt) return null;

  return {
    mention: {
      pageId: mention.page.id,
      pageTitle: mention.page.title,
      eventId: mention.page.eventId,
      mentionedByName: mention.createdBy
        ? getCitizenDisplayName(mention.createdBy)
        : null,
    },
    recipients: [{ citizenId: mention.citizenId }],
  };
};
