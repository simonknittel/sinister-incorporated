import { prisma } from "@sam-monorepo/database";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../../test/applicationContext.js";
import { truncateAllTables } from "../../../test/database.js";
import { findWikiCitizenMentionedRecipient } from "./wikiCitizenMentioned.js";

beforeEach(async () => {
  await truncateAllTables();
});

describe("findWikiCitizenMentionedRecipient", () => {
  test("names a deleted author with the label, not with the handle", async () => {
    const mentionedCitizen = await prisma.citizen.create({
      data: { handle: "mentioned" },
    });
    const author = await prisma.citizen.create({
      data: { handle: "deleted-author", deletedAt: TEST_NOW },
    });
    const mention = await prisma.wikiPageCitizenMention.create({
      data: {
        page: { create: { title: "Mentioning page", slug: "mentioning-page" } },
        citizen: { connect: { id: mentionedCitizen.id } },
        createdBy: { connect: { id: author.id } },
      },
    });
    const { context } = createTestApplicationContext();

    const result = await findWikiCitizenMentionedRecipient(context, {
      mentionId: mention.id,
    });

    expect(result).toEqual({
      mention: {
        pageId: mention.pageId,
        pageTitle: "Mentioning page",
        eventId: null,
        mentionedByName: "Gelöschter Citizen",
      },
      recipients: [{ citizenId: mentionedCitizen.id }],
    });
  });
});
