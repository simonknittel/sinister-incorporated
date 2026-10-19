import * as z from "zod";
import { fetchParameters } from "../common/parameters";

const parameterMap = {
  DATABASE_URL: "/database/connection_string",
  DISCORD_BOT_TOKEN: "/discord/bot_token",
};

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z
    .url()
    .default("postgresql://postgres:admin@localhost:5432/db"),
  DISCORD_GUILD_ID: z.string(),
  DISCORD_BOT_TOKEN: z.string(),
  /** With its path, without a trailing slash */
  DISCORD_API_BASE_URL: z.url().default("https://discord.com/api/v10"),
  AWS_EVENT_BUS_ARN: z.string().nullish(),
  /**
   * The URLs of the application context. The sync reads none of them yet.
   * Terraform sets them when a use case of this function needs a URL.
   */
  BASE_URL: z.url().default("http://localhost:3000"),
  PUBLIC_UPLOAD_BASE_URL: z.url().default("http://localhost:9000/uploads"),
});

const setup = async () => {
  const parameters = await fetchParameters(parameterMap);

  // Also mutated into process.env because the database package reads its
  // configuration from there.
  process.env = {
    ...process.env,
    ...parameters,
  };

  return environmentSchema.parse(process.env);
};

/**
 * Validated environment. Importing it guarantees the SSM parameters were
 * fetched and validated first (top-level await).
 */
export const env = await setup();
