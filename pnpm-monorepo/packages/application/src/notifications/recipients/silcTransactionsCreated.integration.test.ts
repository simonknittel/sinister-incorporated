import { prisma } from "@sam-monorepo/database";
import { beforeEach, describe, expect, test } from "vitest";
import { createTestApplicationContext } from "../../../test/applicationContext.js";
import {
  createCitizenWithInheritedPermissions,
  createCitizenWithLeveledRole,
  MAXIMUM_LEVEL,
} from "../../../test/citizensWithPermissions.js";
import { truncateAllTables } from "../../../test/database.js";
import { findSilcTransactionRecipients } from "./silcTransactionsCreated.js";

const PERMISSION_STRINGS = [
  "login;manage",
  "silcTransactionOfCurrentCitizen;read",
];

const createTransaction = (receiverId: string) =>
  prisma.silcTransaction.create({
    data: { receiverId, value: 100, description: "Test" },
  });

beforeEach(async () => {
  await truncateAllTables();
});

describe("findSilcTransactionRecipients", () => {
  test("notifies a citizen with the permissions only through an inherited role", async () => {
    const citizen = await createCitizenWithInheritedPermissions(
      "inherited",
      PERMISSION_STRINGS,
    );
    const transaction = await createTransaction(citizen.id);
    const { context } = createTestApplicationContext();

    const recipients = await findSilcTransactionRecipients(context, {
      transactionIds: [transaction.id],
    });

    expect(recipients).toEqual([
      {
        citizenId: citizen.id,
        transactionId: transaction.id,
        value: 100,
        description: "Test",
      },
    ]);
  });

  test("notifies only the receiver at the maximum level of the role", async () => {
    const atMaximumLevel = await createCitizenWithLeveledRole(
      "at-maximum-level",
      PERMISSION_STRINGS,
      MAXIMUM_LEVEL,
    );
    const belowMaximumLevel = await createCitizenWithLeveledRole(
      "below-maximum-level",
      PERMISSION_STRINGS,
      MAXIMUM_LEVEL - 1,
    );
    const transactions = await Promise.all([
      createTransaction(atMaximumLevel.id),
      createTransaction(belowMaximumLevel.id),
    ]);
    const { context } = createTestApplicationContext();

    const recipients = await findSilcTransactionRecipients(context, {
      transactionIds: transactions.map((transaction) => transaction.id),
    });

    expect(recipients).toEqual([
      expect.objectContaining({ citizenId: atMaximumLevel.id }),
    ]);
  });
});
