import { prisma } from "@sam-monorepo/database";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../../test/applicationContext.js";
import {
  createCitizenWithInheritedPermissions,
  createCitizenWithLeveledRole,
  MAXIMUM_LEVEL,
} from "../../../test/citizensWithPermissions.js";
import { truncateAllTables } from "../../../test/database.js";
import { findWikiPageReportedRecipients } from "./wikiPageReported.js";

const PERMISSION_STRINGS = ["wiki;manage"];

const createReport = () =>
  prisma.wikiPageReport.create({
    data: {
      page: { create: { title: "Reported page", slug: "reported-page" } },
      message: "Test",
    },
  });

beforeEach(async () => {
  await truncateAllTables();
});

describe("findWikiPageReportedRecipients", () => {
  test("notifies a citizen with the permission only through an inherited role", async () => {
    const citizen = await createCitizenWithInheritedPermissions(
      "inherited",
      PERMISSION_STRINGS,
    );
    const report = await createReport();
    const { context } = createTestApplicationContext();

    const result = await findWikiPageReportedRecipients(context, {
      reportId: report.id,
    });

    expect(result).toEqual({
      report: {
        id: report.id,
        pageTitle: "Reported page",
        uploadFileName: null,
        reportedByName: null,
      },
      recipients: [{ citizenId: citizen.id }],
    });
  });

  test("notifies only the citizen at the maximum level of the role", async () => {
    const atMaximumLevel = await createCitizenWithLeveledRole(
      "at-maximum-level",
      PERMISSION_STRINGS,
      MAXIMUM_LEVEL,
    );
    await createCitizenWithLeveledRole(
      "below-maximum-level",
      PERMISSION_STRINGS,
      MAXIMUM_LEVEL - 1,
    );
    const report = await createReport();
    const { context } = createTestApplicationContext();

    const result = await findWikiPageReportedRecipients(context, {
      reportId: report.id,
    });

    expect(result?.recipients).toEqual([{ citizenId: atMaximumLevel.id }]);
  });

  test("names a deleted reporter with the label, not with the handle", async () => {
    await createCitizenWithInheritedPermissions(
      "moderator",
      PERMISSION_STRINGS,
    );
    const report = await prisma.wikiPageReport.create({
      data: {
        page: { create: { title: "Reported page", slug: "reported-page" } },
        message: "Test",
        createdBy: {
          create: { handle: "deleted-reporter", deletedAt: TEST_NOW },
        },
      },
    });
    const { context } = createTestApplicationContext();

    const result = await findWikiPageReportedRecipients(context, {
      reportId: report.id,
    });

    expect(result?.report.reportedByName).toBe("Gelöschter Citizen");
  });
});
