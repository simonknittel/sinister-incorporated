"use server";

import { redirect } from "next/navigation";
import { serializeError } from "serialize-error";
import { authenticateApi } from "../../../_lib/auth/authenticateAndAuthorize";
import { requestEmailConfirmation } from "../../../_lib/emailConfirmation";
import { log } from "../../../_lib/logging";

export const requestEmailConfirmationAction = async () => {
  const authentication = await authenticateApi();

  if (authentication.session.user.emailVerified) redirect("/clearance");

  try {
    await requestEmailConfirmation(
      authentication.session.user.id,
      authentication.session.user.email!,
    );
  } catch (error) {
    log.error("Error while requesting email confirmation", {
      path: "/email-confirmation",
      error: serializeError(error),
    });
  }
};
