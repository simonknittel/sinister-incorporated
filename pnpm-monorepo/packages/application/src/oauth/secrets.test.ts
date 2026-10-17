import { expect, test } from "vitest";
import { verifyCodeVerifier } from "./secrets.js";

// The example of RFC 7636 appendix B
const CODE_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const CODE_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

test("accepts the code verifier of the code challenge", () => {
  expect(verifyCodeVerifier(CODE_VERIFIER, CODE_CHALLENGE)).toBe(true);
});

test("refuses a different code verifier", () => {
  expect(verifyCodeVerifier(`${CODE_VERIFIER}x`, CODE_CHALLENGE)).toBe(false);
  // The method `plain` is not supported
  expect(verifyCodeVerifier(CODE_CHALLENGE, CODE_CHALLENGE)).toBe(false);
});

test("refuses a code challenge of a different length", () => {
  expect(verifyCodeVerifier(CODE_VERIFIER, CODE_CHALLENGE.slice(1))).toBe(
    false,
  );
});
