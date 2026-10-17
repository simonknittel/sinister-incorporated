import * as z from "zod";
import { isLoopbackHostname, MAX_URL_LENGTH } from "./constants.js";

/** Limits of the arrays of a document, against large documents in the cache */
const MAX_REDIRECT_URIS = 10;
const MAX_TYPES = 10;

/**
 * The Client ID Metadata Document of an OAuth client
 * (draft-ietf-oauth-client-id-metadata-document). Unknown fields are
 * removed. `client_id` must be the URL of the document, character for
 * character.
 */
export const createClientMetadataDocumentSchema = (clientId: string) =>
  z.object({
    client_id: z.literal(clientId),
    client_name: z.string().trim().min(1).max(100),
    redirect_uris: z
      .array(z.url().max(MAX_URL_LENGTH))
      .min(1)
      .max(MAX_REDIRECT_URIS),
    /** A client with a secret cannot use a public document */
    token_endpoint_auth_method: z.literal("none").optional(),
    client_uri: z.url().max(MAX_URL_LENGTH).optional(),
    logo_uri: z.url().max(MAX_URL_LENGTH).optional(),
    scope: z.string().max(1000).optional(),
    grant_types: z.array(z.string().max(100)).max(MAX_TYPES).optional(),
    response_types: z.array(z.string().max(100)).max(MAX_TYPES).optional(),
  });

export type ClientMetadataDocument = z.infer<
  ReturnType<typeof createClientMetadataDocumentSchema>
>;

/**
 * Gives the URL of a client id, or null when the client id is not a valid
 * Client ID Metadata Document URL: `https`, a path, no fragment, no
 * credentials. `allowInsecureLoopback` also permits `http` on a loopback
 * host (the Playwright tests).
 *
 * The client id must be in the normalized form of the URL parser. Thus dot
 * segments, an uppercase host and other forms with two meanings are refused,
 * and the URL that the server fetches is the client id.
 */
export const parseClientId = (
  clientId: string,
  allowInsecureLoopback: boolean,
): URL | null => {
  const url = URL.parse(clientId);
  if (!url || url.href !== clientId) return null;

  // `URL.hash` is empty also for a URL that ends with "#"
  if (clientId.includes("#") || url.username || url.password) return null;

  if (url.pathname === "/") return null;

  if (url.protocol === "https:") return url;

  if (
    url.protocol === "http:" &&
    allowInsecureLoopback &&
    isLoopbackHostname(url.hostname)
  )
    return url;

  return null;
};

/** 1 minute */
const MIN_CACHE_LIFETIME_IN_SECONDS = 60;
/** 24 hours */
const MAX_CACHE_LIFETIME_IN_SECONDS = 24 * 60 * 60;
/** 1 hour */
const DEFAULT_CACHE_LIFETIME_IN_SECONDS = 60 * 60;

/**
 * How long the server keeps a document: `max-age` of the `Cache-Control`
 * header within the limits, or the default without `max-age`
 */
export const getCacheLifetimeInSeconds = (cacheControl: string | undefined) => {
  const maxAge = /(?:^|,)\s*max-age\s*=\s*"?(\d+)"?\s*(?:,|$)/i.exec(
    cacheControl ?? "",
  )?.[1];
  if (maxAge === undefined) return DEFAULT_CACHE_LIFETIME_IN_SECONDS;

  return Math.min(
    Math.max(Number(maxAge), MIN_CACHE_LIFETIME_IN_SECONDS),
    MAX_CACHE_LIFETIME_IN_SECONDS,
  );
};
