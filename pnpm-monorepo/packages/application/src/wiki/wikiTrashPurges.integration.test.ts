import { prisma } from "@sam-monorepo/database";
import { EventSource } from "@sam-monorepo/database/client";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../test/applicationContext.js";
import { truncateAllTables } from "../../test/database.js";
import { purgeOrphanedWikiTags } from "./purgeOrphanedWikiTags.js";
import {
  purgeTrashedWikiPages,
  WIKI_TRASH_RETENTION_DAYS,
} from "./purgeTrashedWikiPages.js";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const daysBeforeTestNow = (days: number) =>
  new Date(TEST_NOW.getTime() - days * ONE_DAY_IN_MILLISECONDS);

const createPage = (
  title: string,
  options: { parentId?: string; deletedAt?: Date } = {},
) =>
  prisma.wikiPage.create({
    data: { title, slug: title.toLowerCase(), ...options },
  });

beforeEach(async () => {
  await truncateAllTables();
});

describe("purgeTrashedWikiPages", () => {
  test("deletes a tree that is in the trash for more than the retention period and keeps the other pages", async () => {
    const expiredDeletedAt = daysBeforeTestNow(WIKI_TRASH_RETENTION_DAYS + 1);
    const root = await createPage("Root", { deletedAt: expiredDeletedAt });
    const child = await createPage("Child", {
      parentId: root.id,
      deletedAt: expiredDeletedAt,
    });
    await createPage("Grandchild", {
      parentId: child.id,
      deletedAt: expiredDeletedAt,
    });
    const recentlyTrashed = await createPage("Recently trashed", {
      deletedAt: daysBeforeTestNow(WIKI_TRASH_RETENTION_DAYS - 1),
    });
    const live = await createPage("Live");
    const { context, auditEvents } = createTestApplicationContext();

    const output = await purgeTrashedWikiPages(context);

    expect(output).toEqual({ purgedPageCount: 3 });
    const remainingPages = await prisma.wikiPage.findMany({
      select: { id: true },
    });
    expect(remainingPages.map((page) => page.id).sort()).toEqual(
      [recentlyTrashed.id, live.id].sort(),
    );
    expect(auditEvents).toEqual([
      {
        type: AuditEventType.TRASHED_WIKI_PAGES_PURGED,
        data: { count: 3 },
        createdById: null,
      },
    ]);
  });
});

describe("purgeOrphanedWikiTags", () => {
  test("deletes the tags that no page uses, in the wiki and in a briefing, and keeps a used tag", async () => {
    const event = await prisma.event.create({
      data: {
        source: EventSource.APP,
        name: "Briefing",
        startTime: new Date(TEST_NOW.getTime() + ONE_DAY_IN_MILLISECONDS),
      },
    });
    const page = await createPage("Tagged");
    const usedTag = await prisma.wikiTag.create({
      data: { name: "used", pages: { create: { pageId: page.id } } },
    });
    await prisma.wikiTag.create({ data: { name: "unused" } });
    await prisma.wikiTag.create({
      data: { name: "unused briefing", eventId: event.id },
    });
    const { context, auditEvents } = createTestApplicationContext();

    const output = await purgeOrphanedWikiTags(context);

    expect(output).toEqual({ purgedTagCount: 2 });
    const remainingTags = await prisma.wikiTag.findMany({
      select: { id: true },
    });
    expect(remainingTags).toEqual([{ id: usedTag.id }]);
    expect(auditEvents).toEqual([
      {
        type: AuditEventType.ORPHANED_WIKI_TAGS_PURGED,
        data: { count: 2 },
        createdById: null,
      },
    ]);
  });
});
