import type { ApplicationContext } from "../context.js";
import { MCP_SCOPE } from "./constants.js";

type MetadataContext = Pick<ApplicationContext, "urls">;

/** The authorization server metadata (RFC 8414) */
export const getAuthorizationServerMetadata = ({ urls }: MetadataContext) => ({
  issuer: urls.issuer,
  authorization_endpoint: new URL("/app/oauth/authorize", urls.baseUrl).href,
  token_endpoint: new URL("/api/oauth/token", urls.baseUrl).href,
  revocation_endpoint: new URL("/api/oauth/revoke", urls.baseUrl).href,
  jwks_uri: new URL("/.well-known/jwks.json", urls.baseUrl).href,
  scopes_supported: [MCP_SCOPE],
  response_types_supported: ["code"],
  response_modes_supported: ["query"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  token_endpoint_auth_methods_supported: ["none"],
  revocation_endpoint_auth_methods_supported: ["none"],
  code_challenge_methods_supported: ["S256"],
  // draft-ietf-oauth-client-id-metadata-document
  client_id_metadata_document_supported: true,
  // RFC 9207
  authorization_response_iss_parameter_supported: true,
});

/** The protected resource metadata of the MCP server (RFC 9728) */
export const getProtectedResourceMetadata = ({ urls }: MetadataContext) => ({
  resource: urls.mcpResourceUrl.href,
  authorization_servers: [urls.issuer],
  scopes_supported: [MCP_SCOPE],
  bearer_methods_supported: ["header"],
});
