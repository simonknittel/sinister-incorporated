import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";

/**
 * The kill switch of the MCP server. While it is on, the MCP endpoint, the
 * OAuth endpoints and the consent page are not available.
 */
export const isMcpServerDisabled = () =>
  getUnleashFlag(UNLEASH_FLAG.DisableMcpServer);
