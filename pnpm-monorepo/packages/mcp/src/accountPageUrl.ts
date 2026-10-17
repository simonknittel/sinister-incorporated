import type { ApplicationContext } from "@sam-monorepo/application";

/** The page where the user selects the tools and manages the clients */
export const getAccountPageUrl = (context: Pick<ApplicationContext, "urls">) =>
  new URL("/app/account/mcp", context.urls.baseUrl).href;
