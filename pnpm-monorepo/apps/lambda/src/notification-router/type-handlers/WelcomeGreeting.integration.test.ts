import { truncateAllTables } from "@sam-monorepo/application/test/database";
import { ONBOARDING_POPOVER_PATH } from "@sam-monorepo/domain";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createCitizenWithInheritedPermissions,
  createCitizenWithPermissions,
} from "../../common/effectivePermissions.fixtures";
import { publishNotifications } from "../publish";
import { WelcomeGreetingHandler } from "./WelcomeGreeting";

vi.mock("../publish", () => ({ publishNotifications: vi.fn() }));

const NON_EMPTY_TEXT = expect.stringMatching(/\S/);

beforeEach(async () => {
  await truncateAllTables();
});

describe("WelcomeGreetingHandler", () => {
  test("welcomes a citizen who can log in", async () => {
    const citizen = await createCitizenWithPermissions("can-log-in", [
      "login;manage",
    ]);

    await WelcomeGreetingHandler({ citizenId: citizen.id });

    expect(publishNotifications).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({
        receiverId: citizen.id,
        notificationType: "welcome",
        payload: { title: NON_EMPTY_TEXT, body: NON_EMPTY_TEXT },
        url: ONBOARDING_POPOVER_PATH,
      }),
    ]);
  });

  test("welcomes a citizen who can log in only through an inherited role", async () => {
    const citizen = await createCitizenWithInheritedPermissions("inherited", [
      "login;manage",
    ]);

    await WelcomeGreetingHandler({ citizenId: citizen.id });

    expect(publishNotifications).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({
        receiverId: citizen.id,
        notificationType: "welcome",
      }),
    ]);
  });

  test("does not welcome a citizen who cannot log in", async () => {
    const citizen = await createCitizenWithPermissions("cannot-log-in", [
      "event;read",
    ]);

    await WelcomeGreetingHandler({ citizenId: citizen.id });

    expect(publishNotifications).not.toHaveBeenCalled();
  });
});
