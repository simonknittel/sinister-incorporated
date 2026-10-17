import { getApplicationContext, toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getDisabledToolNames } from "@sam-monorepo/application";
import {
  listToolCatalog,
  TOOL_GROUP_TITLES,
  ToolGroup,
  type ToolCatalogEntry,
} from "@sam-monorepo/mcp";
import { forbidden } from "next/navigation";
import { cache } from "react";

export interface McpToolWithSetting extends ToolCatalogEntry {
  readonly isEnabled: boolean;
}

export interface McpToolSettingsGroup {
  readonly group: ToolGroup;
  readonly title: string;
  readonly tools: McpToolWithSetting[];
}

/**
 * All tools of the catalog, grouped in the order of `tools/list`. A tool is
 * enabled when the user did not disable it.
 */
export const getMyMcpToolSettings = cache(
  withTrace("getMyMcpToolSettings", async () => {
    const authentication = await requireAuthentication();
    // Only the user sees the own tool settings, not an admin who assumes the
    // user
    if (authentication.session.assumedByAdminId) forbidden();

    const disabledToolNames = new Set(
      await getDisabledToolNames(
        getApplicationContext(),
        await toActor(authentication.session),
      ),
    );
    const catalog = listToolCatalog();

    return Object.values(ToolGroup)
      .map((group): McpToolSettingsGroup => ({
        group,
        title: TOOL_GROUP_TITLES[group],
        tools: catalog
          .filter((tool) => tool.group === group)
          .map((tool) => ({
            ...tool,
            isEnabled: !disabledToolNames.has(tool.name),
          })),
      }))
      .filter((group) => group.tools.length > 0);
  }),
);
