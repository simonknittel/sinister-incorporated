import { describe, expect, test } from "vitest";
import comparePermissionSets from "./comparePermissionSets";

describe("compare permission sets", () => {
  test("permission set containing no attributes vs. no permission sets", () => {
    expect(
      comparePermissionSets({ resource: "lastSeen", operation: "read" }, []),
    ).toBe(false);
  });

  test("permission set containing no attributes vs. one permission set which is matching", () => {
    expect(
      comparePermissionSets({ resource: "lastSeen", operation: "read" }, [
        { resource: "lastSeen", operation: "read" },
      ]),
    ).toBe(true);
  });

  test("permission set containing no attributes vs. one permission set which is more specific", () => {
    expect(
      comparePermissionSets({ resource: "note", operation: "create" }, [
        {
          resource: "note",
          operation: "manage",
          attributes: [{ key: "noteTypeId", value: "1" }],
        },
      ]),
    ).toBe(false);
  });

  test("permission set containing one attribute vs. one permission set which is matching", () => {
    expect(
      comparePermissionSets(
        {
          resource: "note",
          operation: "create",
          attributes: [
            {
              key: "noteTypeId",
              value: "1",
            },
          ],
        },
        [
          {
            resource: "note",
            operation: "manage",
            attributes: [
              {
                key: "noteTypeId",
                value: "1",
              },
            ],
          },
        ],
      ),
    ).toBe(true);
  });

  test("permission set containing one attribute which is a boolean vs. one permission set which is matching", () => {
    expect(
      comparePermissionSets(
        {
          resource: "organizationMembership",
          operation: "read",
          attributes: [
            {
              key: "alsoVisibilityRedacted",
              value: true,
            },
          ],
        },

        [
          {
            resource: "organizationMembership",
            operation: "read",
            attributes: [
              {
                key: "alsoVisibilityRedacted",
                value: "true",
              },
            ],
          },
        ],
      ),
    ).toBe(true);
  });

  test("permission set containing one attribute vs. one permission set which has manage but the attribute isn't matching", () => {
    expect(
      comparePermissionSets(
        {
          resource: "note",
          operation: "create",
          attributes: [
            {
              key: "noteTypeId",
              value: "1",
            },
          ],
        },

        [
          {
            resource: "note",
            operation: "manage",
            attributes: [
              {
                key: "noteTypeId",
                value: "2",
              },
            ],
          },
        ],
      ),
    ).toBe(false);
  });

  test("permission set containing one attribute vs. one permission which is matching and has a wildcard", () => {
    expect(
      comparePermissionSets(
        {
          resource: "note",
          operation: "create",
          attributes: [
            {
              key: "noteTypeId",
              value: "1",
            },
          ],
        },

        [
          {
            resource: "note",
            operation: "create",
            attributes: [
              {
                key: "noteTypeId",
                value: "*",
              },
            ],
          },
        ],
      ),
    ).toBe(true);
  });

  test("permission set containing one attribute vs. one permission which has a wildcard but hasn't a matching operation", () => {
    expect(
      comparePermissionSets(
        {
          resource: "note",
          operation: "read",
          attributes: [
            {
              key: "noteTypeId",
              value: "1",
            },
          ],
        },

        [
          {
            resource: "note",
            operation: "create",
            attributes: [
              {
                key: "noteTypeId",
                value: "*",
              },
            ],
          },
        ],
      ),
    ).toBe(false);
  });

  test("permission set containing one attributes vs. one permission without attributes", () => {
    expect(
      comparePermissionSets(
        {
          resource: "organizationMembership",
          operation: "read",
          attributes: [
            {
              key: "alsoVisibilityRedacted",
              value: true,
            },
          ],
        },
        [
          {
            resource: "organizationMembership",
            operation: "read",
          },
        ],
      ),
    ).toBe(true);
  });

  test("permission set containing one attribute vs. one permission sets containing one attribute but with a different key", () => {
    expect(
      comparePermissionSets(
        {
          resource: "organizationMembership",
          operation: "read",
          attributes: [
            {
              key: "alsoVisibilityRedacted",
              value: true,
            },
          ],
        },

        [
          {
            resource: "organizationMembership",
            operation: "read",
            attributes: [
              {
                key: "confirmed",
                value: "true",
              },
            ],
          },
        ],
      ),
    ).toBe(false);
  });

  test("permission set containing no attributes vs. one permission sets which is matching but also gets negated", () => {
    expect(
      comparePermissionSets({ resource: "login", operation: "manage" }, [
        { resource: "login", operation: "manage" },
        { resource: "login", operation: "negate" },
      ]),
    ).toBe(false);
  });
});
