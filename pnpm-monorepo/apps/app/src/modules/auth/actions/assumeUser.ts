"use server";

import {
  ActionGate,
  createAuthenticatedAction,
} from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
} from "@/modules/application";
import { getServerCookieOptions } from "@/modules/common/utils/getServerCookieOptions";
import {
  startAssumingUser,
  startAssumingUserInputSchema,
} from "@sam-monorepo/application";
import { cookies } from "next/headers";
import {
  ADMIN_MODE_COOKIE,
  ASSUME_USER_COOKIE,
  ASSUME_USER_COOKIE_MAX_AGE,
} from "../utils/adminCookies";
import { AUTH_ERROR_TEXTS } from "../utils/authErrorTexts";

/** The session holds the other fields of the input */
const schema = startAssumingUserInputSchema.pick({ target_user_id: true });

export const assumeUser = createAuthenticatedAction(
  "assumeUser",
  schema,
  async (formData, authentication, data, t) => {
    const { session } = authentication;

    let assumedUser;
    try {
      assumedUser = await startAssumingUser(getApplicationContext(), {
        admin_user_id: session.assumedByAdminId ?? session.user.id,
        target_user_id: data.target_user_id,
        current_assumed_user: session.assumedByAdminId
          ? { id: session.user.id, name: session.user.name ?? null }
          : null,
      });
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: AUTH_ERROR_TEXTS,
      });
    }

    const cookieStore = await cookies();
    // The permissions of the assumed user must apply, not the admin mode
    cookieStore.delete(ADMIN_MODE_COOKIE);
    cookieStore.set(
      ASSUME_USER_COOKIE,
      assumedUser.id,
      getServerCookieOptions(ASSUME_USER_COOKIE_MAX_AGE),
    );

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    gate: ActionGate.Admin,
    parseFormData: (formData) => ({
      target_user_id: formData.get("userId"),
    }),
  },
);
