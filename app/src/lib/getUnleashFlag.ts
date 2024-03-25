import { flag } from "@unleash/nextjs";
import { cache } from "react";
import { serializeError } from "serialize-error";
import { authenticate } from "./auth/authenticateAndAuthorize";
import { log } from "./logging";

export const getUnleashFlag = cache(
  async (
    name:
      | "DisableAlgolia"
      | "EnablePreviewComments"
      | "EnableCareBearShooter"
      | "DisableConfirmationEmail"
      | "DisableConfirmedEmailRequirement"
      | "DisableRoleNameSuggestions"
      | "EnableOperations",
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
