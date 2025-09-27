import { env } from "@/env";
import { getUnleashFlag } from "./getUnleashFlag";
import { UNLEASH_FLAG } from "./UNLEASH_FLAG";

export const isOpenAIEnabled = async (key: "RoleNameSuggestions") => {
  if (!env.OPENAI_API_KEY) return false;

  if (
    key === "RoleNameSuggestions" &&
    (await getUnleashFlag(UNLEASH_FLAG.DisableRoleNameSuggestions))
  )
    return false;

  return true;
};
