import { getApplicationContext } from "@/modules/application";
import { handleMcpRequest } from "@/modules/mcp/utils/handleMcpRequest";
import { withCorsHeaders } from "@/modules/mcp/utils/withCorsHeaders";
import { isMcpServerDisabled } from "@/modules/oauth/utils/isMcpServerDisabled";
import {
  corsPreflightResponse,
  temporarilyUnavailableResponse,
} from "@/modules/oauth/utils/responses";

/**
 * The MCP endpoint (revision 2026-07-28, stateless). Next.js answers `405`
 * for the other methods.
 */
export const POST = async (request: Request) => {
  if (await isMcpServerDisabled()) return temporarilyUnavailableResponse();

  return withCorsHeaders(
    await handleMcpRequest(getApplicationContext(), request),
  );
};

/** Browser-based clients call the endpoint from a different origin */
export const OPTIONS = () =>
  corsPreflightResponse(
    "POST, OPTIONS",
    "Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Method, Mcp-Name",
  );
