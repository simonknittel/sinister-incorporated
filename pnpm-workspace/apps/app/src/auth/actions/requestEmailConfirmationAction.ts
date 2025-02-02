"use server";

import { authenticate } from "@/auth/server";
import { requestEmailConfirmation } from "@/auth/utils/emailConfirmation";
import { log } from "@/logging";
import { redirect } from "next/navigation";
import { serializeError } from "serialize-error";

export const requestEmailConfirmationAction = async () => {
  const authentication = await authenticate();
  if (!authentication) {
    void log.info("Unauthorized request to action", {
      actionName: "requestEmailConfirmationAction",
      reason: "No session",
    });

    throw new Error("Unauthorized");
  }

  if (authentication.session.user.emailVerified) redirect("/clearance");

  try {
    await requestEmailConfirmation(
      authentication.session.user.id,
      authentication.session.user.email!,
    );
  } catch (error) {
    void log.error("Error while requesting email confirmation", {
      path: "/email-confirmation",
      error: serializeError(error),
    });
  }
};
