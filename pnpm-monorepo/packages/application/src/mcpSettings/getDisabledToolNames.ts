import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/**
 * The names of the MCP tools that the user disabled on the account page. A
 * tool without a row is enabled (see the `McpToolSetting` model).
 */
export const getDisabledToolNames = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<string[]> => {
  const settings = await context.prisma.mcpToolSetting.findMany({
    where: { userId: actor.userId },
    select: { toolName: true },
    orderBy: { toolName: "asc" },
  });

  return settings.map((setting) => setting.toolName);
};
