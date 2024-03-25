import { env } from "../../env.mjs";

export const checkResponseForError = (
  data: Record<string, unknown> | Array<unknown>,
) => {
  if (Array.isArray(data) || typeof data.message !== "string") return;

  if (data.message === "You are being rate limited.") {
    throw new Error("Rate Limiting der Discord API");
  } else if (data.message === "Unknown Guild") {
    throw new Error(
      `Der Discord Server "${env.DISCORD_GUILD_ID}" existiert nicht.`,
    );
  } else if (data.message === "Missing Access") {
    throw new Error(
      `Diese Anwendung hat keinen Zugriff auf den Discord Server "${env.DISCORD_GUILD_ID}".`,
    );
  }

  throw new Error(data.message);
};
