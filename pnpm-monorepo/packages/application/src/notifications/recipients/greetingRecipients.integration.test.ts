import { beforeEach, describe, expect, test } from "vitest";
import { createTestApplicationContext } from "../../../test/applicationContext.js";
import {
  createCitizenWithInheritedPermissions,
  createCitizenWithPermissions,
} from "../../../test/citizensWithPermissions.js";
import { truncateAllTables } from "../../../test/database.js";
import { findWelcomeGreetingRecipient } from "./greetingRecipients.js";

beforeEach(async () => {
  await truncateAllTables();
});

describe("findWelcomeGreetingRecipient", () => {
  test("welcomes a citizen who can log in", async () => {
    const citizen = await createCitizenWithPermissions("can-log-in", [
      "login;manage",
    ]);
    const { context } = createTestApplicationContext();

    expect(
      await findWelcomeGreetingRecipient(context, { citizenId: citizen.id }),
    ).toEqual({ citizenId: citizen.id });
  });

  test("welcomes a citizen who can log in only through an inherited role", async () => {
    const citizen = await createCitizenWithInheritedPermissions("inherited", [
      "login;manage",
    ]);
    const { context } = createTestApplicationContext();

    expect(
      await findWelcomeGreetingRecipient(context, { citizenId: citizen.id }),
    ).toEqual({ citizenId: citizen.id });
  });

  test("does not welcome a citizen who cannot log in", async () => {
    const citizen = await createCitizenWithPermissions("cannot-log-in", [
      "event;read",
    ]);
    const { context } = createTestApplicationContext();

    expect(
      await findWelcomeGreetingRecipient(context, { citizenId: citizen.id }),
    ).toBeNull();
  });
});
