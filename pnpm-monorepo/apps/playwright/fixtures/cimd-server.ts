import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * The Client ID Metadata Documents (CIMD) of the MCP test client, one server
 * per Playwright worker. A real client id is an HTTPS URL on the internet.
 * The stack permits plain HTTP on the loopback interface instead (see
 * `OAUTH_ALLOW_INSECURE_LOOPBACK_CLIENT_IDS` in setup/stack.ts).
 */

export const CIMD_CLIENT_NAME = "Playwright MCP Client";

/**
 * The redirect URIs of the test client. The authorization server ignores
 * the port of a loopback redirect URI (RFC 8252 section 7.3), thus a request
 * can use any port.
 */
export const CIMD_REDIRECT_URIS = [
  "http://127.0.0.1/callback",
  "http://localhost/callback",
];

/** The minimum cache lifetime of the authorization server */
const CACHE_MAX_AGE_IN_SECONDS = 60;

enum CimdPath {
  Valid = "/client.json",
  /** A document whose `client_id` names a different URL */
  MismatchingClientId = "/mismatching-client.json",
  /** No document: the server answers 404 */
  Missing = "/missing-client.json",
}

export interface CimdServer {
  /** The client id of the test client: the URL of its document */
  readonly clientId: string;
  /** The URL of a document whose `client_id` is a different URL */
  readonly mismatchingClientId: string;
  /** The URL of a document that does not exist */
  readonly missingClientId: string;
  /** The host of the client ids, which the consent page shows */
  readonly host: string;
  readonly close: () => Promise<void>;
}

const createDocument = (clientId: string) => ({
  client_id: clientId,
  client_name: CIMD_CLIENT_NAME,
  redirect_uris: CIMD_REDIRECT_URIS,
  token_endpoint_auth_method: "none",
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
});

export const startCimdServer = async (): Promise<CimdServer> => {
  let origin = "";
  const clientIdOf = (path: CimdPath) => new URL(path, origin).href;

  const server: Server = createServer((request, response) => {
    const path = new URL(request.url ?? "/", origin).pathname;

    const respond = (document: object) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": `max-age=${CACHE_MAX_AGE_IN_SECONDS}`,
      });
      response.end(JSON.stringify(document));
    };

    switch (path) {
      case CimdPath.Valid:
        respond(createDocument(clientIdOf(CimdPath.Valid)));
        return;

      case CimdPath.MismatchingClientId:
        respond(createDocument(clientIdOf(CimdPath.Valid)));
        return;

      default:
        response.writeHead(404);
        response.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  origin = `http://127.0.0.1:${port}`;

  return {
    clientId: clientIdOf(CimdPath.Valid),
    mismatchingClientId: clientIdOf(CimdPath.MismatchingClientId),
    missingClientId: clientIdOf(CimdPath.Missing),
    host: new URL(origin).host,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
};
