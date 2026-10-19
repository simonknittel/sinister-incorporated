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
import type { Recipient } from "./recipient.js";
import { findRoleAddedRecipient } from "./roleAdded.js";

const createAddedRole = () =>
  prisma.role.create({ data: { name: "Added role" } });

const getPermissionStrings = (addedRoleId: string) => [
  "login;manage",
  `otherRole;read;roleId=${addedRoleId}`,
];

beforeEach(async () => {
  await truncateAllTables();
});

describe("findRoleAddedRecipient", () => {
  test("notifies a citizen with the permissions only through an inherited role", async () => {
    const addedRole = await createAddedRole();
    const citizen = await createCitizenWithInheritedPermissions(
      "inherited",
      getPermissionStrings(addedRole.id),
    );
    const { context } = createTestApplicationContext();

    const result = await findRoleAddedRecipient(context, {
      citizenId: citizen.id,
      roleId: addedRole.id,
    });

    expect(result).toEqual({
      role: { id: addedRole.id, name: addedRole.name },
      recipients: [{ citizenId: citizen.id }],
    });
  });

  test("notifies only the citizen at the maximum level of the role", async () => {
    const addedRole = await createAddedRole();
    const atMaximumLevel = await createCitizenWithLeveledRole(
      "at-maximum-level",
      getPermissionStrings(addedRole.id),
      MAXIMUM_LEVEL,
    );
    const belowMaximumLevel = await createCitizenWithLeveledRole(
      "below-maximum-level",
      getPermissionStrings(addedRole.id),
      MAXIMUM_LEVEL - 1,
    );
    const { context } = createTestApplicationContext();

    const recipients: Recipient[] = [];
    for (const citizen of [atMaximumLevel, belowMaximumLevel]) {
      const result = await findRoleAddedRecipient(context, {
        citizenId: citizen.id,
        roleId: addedRole.id,
      });
      recipients.push(...(result?.recipients ?? []));
    }

    expect(recipients).toEqual([{ citizenId: atMaximumLevel.id }]);
  });

  test("does not notify a deleted citizen", async () => {
    const addedRole = await createAddedRole();
    const citizen = await createCitizenWithLeveledRole(
      "deleted",
      getPermissionStrings(addedRole.id),
      MAXIMUM_LEVEL,
    );
    const { context } = createTestApplicationContext();
    const input = { citizenId: citizen.id, roleId: addedRole.id };

    expect((await findRoleAddedRecipient(context, input))?.recipients).toEqual([
      { citizenId: citizen.id },
    ]);

    await prisma.citizen.update({
      where: { id: citizen.id },
      data: { deletedAt: TEST_NOW },
    });

    expect((await findRoleAddedRecipient(context, input))?.recipients).toEqual(
      [],
    );
  });
});
