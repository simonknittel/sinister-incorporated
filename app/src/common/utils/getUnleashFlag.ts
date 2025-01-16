import { authenticate } from "@/auth/server";
import { log } from "@/logging";
import { evaluateFlags, flagsClient, getDefinitions } from "@unleash/nextjs";
import { cache } from "react";
import { serializeError } from "serialize-error";

export const getUnleashFlag = cache(
  async (
    name:
      | "DisableAlgolia"
      | "EnablePreviewComments"
      | "EnableCareBearShooter"
      | "DisableConfirmationEmail"
      | "DisableRoleNameSuggestions"
      | "EnableOperations"
      | "EnableNotifications",
  ) => {
    try {
      const authentication = await authenticate();

      const definitions = await getDefinitions({
        fetchOptions: {
          next: { revalidate: 30 },
        },
      });

      const { toggles } = evaluateFlags(definitions, {
        userId: authentication ? authentication.session.user.id : undefined,
      });

      const flags = flagsClient(toggles);

      return flags.isEnabled(name);
    } catch (error) {
      void log.error("Error fetching feature flag", {
        error: serializeError(error),
      });
    }
  },
);
