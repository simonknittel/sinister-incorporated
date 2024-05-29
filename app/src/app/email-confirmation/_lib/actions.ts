"use server";

import { redirect } from "next/navigation";
import { serializeError } from "serialize-error";
import { authenticate } from "../../../lib/auth/server";
import { requestEmailConfirmation } from "../../../lib/emailConfirmation";
import { log } from "../../../lib/logging";

export const requestEmailConfirmationAction = async () => {
  const authentication = await authenticate();

  if (!authentication) {
    await log.info("Unauthenticated request to action", {
      actionName: "requestEmailConfirmationAction",
      reason: "No session",
    });

    throw new Error("Unauthenticated");
  }

  if (authentication.session.user.emailVerified) redirect("/clearance");

  try {
    await requestEmailConfirmation(
      authentication.session.user.id,
      authentication.session.user.email!,
    );
  } catch (error) {
    await log.error("Error while requesting email confirmation", {
      path: "/email-confirmation",
      error: serializeError(error),
    });
  }
};
