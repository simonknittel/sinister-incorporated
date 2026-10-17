import { describe, expect, test } from "vitest";
import {
  isPermittedRedirectUri,
  matchRedirectUri,
} from "./matchRedirectUri.js";

describe("matchRedirectUri", () => {
  test("permits only an exact match of a URI that is not loopback", () => {
    const registered = ["https://claude.ai/api/mcp/auth_callback"];

    expect(
      matchRedirectUri(registered, "https://claude.ai/api/mcp/auth_callback"),
    ).toBe("https://claude.ai/api/mcp/auth_callback");
    expect(
      matchRedirectUri(registered, "https://claude.ai/api/mcp/auth_callback/"),
    ).toBeNull();
    expect(
      matchRedirectUri(
        registered,
        "https://claude.ai:8443/api/mcp/auth_callback",
      ),
    ).toBeNull();
  });

  test("ignores the port of a loopback URI (RFC 8252 section 7.3)", () => {
    const registered = [
      "http://localhost/callback",
      "http://127.0.0.1:1234/callback",
    ];

    expect(
      matchRedirectUri(registered, "http://localhost:54321/callback"),
    ).toBe("http://localhost/callback");
    expect(matchRedirectUri(registered, "http://127.0.0.1:9/callback")).toBe(
      "http://127.0.0.1:1234/callback",
    );
  });

  test("requires the same host, scheme and path for a loopback URI", () => {
    const registered = ["http://localhost/callback"];

    expect(
      matchRedirectUri(registered, "http://127.0.0.1:54321/callback"),
    ).toBeNull();
    expect(
      matchRedirectUri(registered, "https://localhost:54321/callback"),
    ).toBeNull();
    expect(
      matchRedirectUri(registered, "http://localhost:54321/other"),
    ).toBeNull();
    expect(
      matchRedirectUri(registered, "http://localhost:54321/callback?next=1"),
    ).toBeNull();
  });
});

describe("isPermittedRedirectUri", () => {
  test("permits https, loopback http and private-use schemes", () => {
    expect(isPermittedRedirectUri("https://claude.ai/callback")).toBe(true);
    expect(isPermittedRedirectUri("http://[::1]:8080/callback")).toBe(true);
    expect(isPermittedRedirectUri("com.example.app:/callback")).toBe(true);
  });

  test("refuses schemes that can run code or leak the code", () => {
    expect(isPermittedRedirectUri("javascript:alert(1)")).toBe(false);
    expect(isPermittedRedirectUri("data:text/html,x")).toBe(false);
    expect(isPermittedRedirectUri("http://example.com/callback")).toBe(false);
    expect(isPermittedRedirectUri("https://claude.ai/callback#x")).toBe(false);
  });
});
