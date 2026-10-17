import { CORS_HEADERS } from "@/modules/oauth/utils/responses";

/**
 * Adds the CORS headers to a response of the MCP endpoint. The endpoint uses
 * no cookies, and browser-based MCP clients call it from a different origin.
 */
export const withCorsHeaders = (response: Response) => {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(CORS_HEADERS))
    headers.set(name, value);
  // The challenge of a `401` tells a client where the authorization server is
  headers.set("Access-Control-Expose-Headers", "WWW-Authenticate");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
