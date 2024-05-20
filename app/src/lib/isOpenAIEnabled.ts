import { env } from "../env.mjs";
import { dedupedGetUnleashFlag } from "./getUnleashFlag";

export const isOpenAIEnabled = async (key: "RoleNameSuggestions") => {
  if (!env.OPENAI_API_KEY) return false;
  if (await dedupedGetUnleashFlag(`Disable${key}`)) return false;
  return true;
};
