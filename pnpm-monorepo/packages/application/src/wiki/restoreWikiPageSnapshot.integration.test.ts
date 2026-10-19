import { prisma } from "@sam-monorepo/database";
import { WikiPageSnapshotKind } from "@sam-monorepo/database/client";
import { beforeEach, expect, test } from "vitest";
import {
  createTestActor,
  createTestApplicationContext,
} from "../../test/applicationContext.js";
import { createTestCollabServer } from "../../test/collabServer.js";
import { truncateAllTables } from "../../test/database.js";
import { ConflictError } from "../errors.js";
import { restoreWikiPageSnapshot } from "./restoreWikiPageSnapshot.js";
import { WikiErrorMessage } from "./wikiErrors.js";

const SAFETY_SNAPSHOT_NAME = "Safety snapshot";

/** `wiki;manage` gives the admin tier on each page of the global wiki */
const WIKI_MANAGER = createTestActor({
  userId: "wiki-manager",
  permissionStrings: ["wiki;manage"],
});

const toDocument = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

beforeEach(async () => {
  await truncateAllTables();
});

const createPageWithSnapshot = async () => {
  const page = await prisma.wikiPage.create({
    data: { title: "Page", slug: "page", content: toDocument("Current") },
  });
  const snapshot = await prisma.wikiPageSnapshot.create({
    data: {
      pageId: page.id,
      kind: WikiPageSnapshotKind.AUTO,
      content: toDocument("Old"),
    },
  });

  return { page, snapshot };
};

const findSafetySnapshots = (pageId: string) =>
  prisma.wikiPageSnapshot.findMany({
    where: { pageId, kind: WikiPageSnapshotKind.MANUAL },
    select: { name: true, content: true },
  });

test("replaces the content through the collab server after a safety snapshot", async () => {
  const { page, snapshot } = await createPageWithSnapshot();
  const { collab, replacements } = createTestCollabServer();
  const { context } = createTestApplicationContext({ collab });

  await restoreWikiPageSnapshot(
    context,
    WIKI_MANAGER,
    { snapshot_id: snapshot.id },
    { safetySnapshotName: SAFETY_SNAPSHOT_NAME },
  );

  expect(replacements).toHaveLength(1);
  expect(replacements[0]).toMatchObject({
    pageId: page.id,
    updatedByEntityId: null,
  });
  expect(await findSafetySnapshots(page.id)).toEqual([
    { name: SAFETY_SNAPSHOT_NAME, content: toDocument("Current") },
  ]);
});

test("keeps the safety snapshot when the collab server does not take the content", async () => {
  const { page, snapshot } = await createPageWithSnapshot();
  const { collab } = createTestCollabServer({ failsReplace: true });
  const { context } = createTestApplicationContext({ collab });

  const restore = restoreWikiPageSnapshot(
    context,
    WIKI_MANAGER,
    { snapshot_id: snapshot.id },
    { safetySnapshotName: SAFETY_SNAPSHOT_NAME },
  );

  await expect(restore).rejects.toBeInstanceOf(ConflictError);
  await expect(restore).rejects.toThrow(WikiErrorMessage.SnapshotRestoreFailed);
  expect(await findSafetySnapshots(page.id)).toEqual([
    { name: SAFETY_SNAPSHOT_NAME, content: toDocument("Current") },
  ]);
});
