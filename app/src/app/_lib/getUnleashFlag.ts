import { flag } from "@unleash/nextjs";
import { cache } from "react";
import { serializeError } from "serialize-error";
import { log } from "~/_lib/logging";
import { authenticate } from "../../_lib/auth/authenticateAndAuthorize";

export const getUnleashFlag = cache(
  async (
    name:
      | "DisableAlgolia"
      | "EnablePreviewComments"
      | "EnableCareBearShooter"
      | "DisableConfirmationEmail"
      | "DisableConfirmedEmailRequirement"
      | "DisableRoleNameSuggestions",
  ) => {
    const authentication = await authenticate();

    const result = await flag(name, {
      userId: authentication ? authentication.session.user.id : undefined,
    });

    if (result.error) {
      log.error("Error fetching feature flag", {
        error: serializeError(result.error),
      });
    }

    return result.enabled;
  },
);
