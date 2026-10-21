import { createElement } from "react";
import { describe, expect, test } from "vitest";
import { getAppKey } from "./getAppKey";
import type { ExternalApp, IntegratedApp, RedactedApp } from "./types";

const integratedApp = (slug: string, name = slug): IntegratedApp => ({
  name,
  description: "",
  slug,
  href: `/app/${slug}`,
});

const externalApp = (slug: string, name = slug): ExternalApp => ({
  id: slug,
  name,
  description: "",
  slug,
  defaultPage: { iframeUrl: "https://example.com" },
  team: [],
  icon: createElement("span"),
});

const redactedApp = (name: string): RedactedApp => ({ name, redacted: true });

describe("getAppKey", () => {
  test("namespaces integrated apps", () => {
    expect(getAppKey(integratedApp("dashboard"))).toBe("integrated:dashboard");
  });

  test("namespaces external apps", () => {
    expect(getAppKey(externalApp("silo-request"))).toBe(
      "external:silo-request",
    );
  });

  test("returns nothing for redacted apps", () => {
    expect(getAppKey(redactedApp("Spynet"))).toBeUndefined();
  });

  test("keeps an integrated and an external app with the same slug apart", () => {
    expect(getAppKey(integratedApp("tasks"))).not.toBe(
      getAppKey(externalApp("tasks")),
    );
  });
});
