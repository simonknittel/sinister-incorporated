import { describe, expect, test } from "vitest";
import {
  createClientMetadataDocumentSchema,
  parseClientId,
} from "./clientMetadataDocument.js";

const CLIENT_ID = "https://claude.ai/oauth/mcp-oauth-client-metadata";

const DOCUMENT = {
  client_id: CLIENT_ID,
  client_name: "Claude",
  redirect_uris: ["https://claude.ai/api/mcp/auth_callback"],
  token_endpoint_auth_method: "none",
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  unknown_field: "ignored",
};

describe("the client metadata document", () => {
  const schema = createClientMetadataDocumentSchema(CLIENT_ID);

  test("accepts a valid document and removes unknown fields", () => {
    const result = schema.safeParse(DOCUMENT);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("unknown_field");
  });

  test("refuses a client_id that is not the URL of the document", () => {
    expect(
      schema.safeParse({ ...DOCUMENT, client_id: `${CLIENT_ID}/other` })
        .success,
    ).toBe(false);
  });

  test("refuses more than 10 redirect URIs", () => {
    expect(
      schema.safeParse({
        ...DOCUMENT,
        redirect_uris: Array.from(
          { length: 11 },
          (_value, index) => `https://claude.ai/callback/${index}`,
        ),
      }).success,
    ).toBe(false);
  });

  test("refuses a client with a secret", () => {
    expect(
      schema.safeParse({
        ...DOCUMENT,
        token_endpoint_auth_method: "client_secret_basic",
      }).success,
    ).toBe(false);
  });
});

describe("parseClientId", () => {
  test("accepts an https URL with a path", () => {
    expect(parseClientId(CLIENT_ID, false)?.href).toBe(CLIENT_ID);
  });

  test("refuses URLs that are not a document URL", () => {
    for (const clientId of [
      "https://claude.ai/",
      "https://claude.ai",
      "https://claude.ai/a/../metadata",
      "https://user:password@claude.ai/metadata",
      "https://claude.ai/metadata#fragment",
      "http://claude.ai/metadata",
      "http://localhost:1234/metadata",
    ])
      expect(parseClientId(clientId, false), clientId).toBeNull();
  });

  test("accepts http on a loopback host only with the test flag", () => {
    expect(
      parseClientId("http://127.0.0.1:1234/metadata", true),
    ).not.toBeNull();
    expect(parseClientId("http://example.com/metadata", true)).toBeNull();
  });
});
