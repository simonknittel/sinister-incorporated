"use server";

import {
  ActionGate,
  createAuthenticatedAction,
} from "@/modules/actions/utils/createAction";
import { getApplicationContext } from "@/modules/application";
import { stopAssumingUser as stopAssumingUserUseCase } from "@sam-monorepo/application";
import { cookies } from "next/headers";
import * as z from "zod";
import { ASSUME_USER_COOKIE } from "../utils/adminCookies";

const schema = z.object({});

export const stopAssumingUser = createAuthenticatedAction(
  "stopAssumingUser",
  schema,
  async (formData, authentication, data, t) => {
    const { session } = authentication;

    // A session of the own user has no assume to end
    if (session.assumedByAdminId)
      await stopAssumingUserUseCase(getApplicationContext(), {
        admin_user_id: session.assumedByAdminId,
        assumed_user_id: session.user.id,
        assumed_user_name: session.user.name ?? null,
      });

    (await cookies()).delete(ASSUME_USER_COOKIE);

    return {
      success: t("Common.successfullySaved"),
    };
  },
  { gate: ActionGate.Admin },
);
