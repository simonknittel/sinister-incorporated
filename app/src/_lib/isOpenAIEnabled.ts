import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import { env } from "~/env.mjs";

export const isOpenAIEnabled = async (key: "RoleNameSuggestions") => {
  if (!env.OPENAI_API_KEY) return false;
  if (await getUnleashFlag(`Disable${key}`)) return false;
  return true;
};
