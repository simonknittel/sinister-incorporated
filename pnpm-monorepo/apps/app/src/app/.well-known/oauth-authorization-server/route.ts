import { getApplicationContext } from "@/modules/application";
import { isMcpServerDisabled } from "@/modules/oauth/utils/isMcpServerDisabled";
import {
  corsPreflightResponse,
  metadataResponse,
  temporarilyUnavailableResponse,
} from "@/modules/oauth/utils/responses";
import { getAuthorizationServerMetadata } from "@sam-monorepo/application";

/** The authorization server metadata (RFC 8414) of the MCP OAuth server */
export const GET = async () => {
  if (await isMcpServerDisabled()) return temporarilyUnavailableResponse();

  return metadataResponse(
    getAuthorizationServerMetadata(getApplicationContext()),
  );
};

export const OPTIONS = () => corsPreflightResponse("GET, OPTIONS", "*");
