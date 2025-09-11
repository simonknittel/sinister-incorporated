import { env } from "@/env";
import { getUnleashFlag } from "./getUnleashFlag";

export const isOpenAIEnabled = async (key: "RoleNameSuggestions") => {
  if (!env.OPENAI_API_KEY) return false;
  if (await getUnleashFlag(`Disable${key}`)) return false;
  return true;
};
