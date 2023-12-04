import { expect, test } from "vitest";
import comparePermissionSets from "./comparePermissionSets";

test("simple", () => {
  expect(comparePermissionSets([], [])).toBe(true);

  expect(
    comparePermissionSets([{ resource: "lastSeen", operation: "read" }], []),
  ).toBe(false);

  expect(
    comparePermissionSets(
      [{ resource: "lastSeen", operation: "read" }],
      [{ resource: "lastSeen", operation: "read" }],
    ),
  ).toBe(true);
});

test.skip("notes", () => {
  expect(
    comparePermissionSets(
      [{ resource: "note", operation: "create" }],
      [{ resource: "note", operation: "manage" }],
    ),
  ).toBe(true);

  expect(
    comparePermissionSets(
      [
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
      ],
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

  expect(
    comparePermissionSets(
      [
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
      ],
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

test("login", () => {
  expect(
    comparePermissionSets(
      [{ resource: "login", operation: "manage" }],
      [{ resource: "login", operation: "manage" }],
    ),
  ).toBe(true);

  expect(
    comparePermissionSets(
      [{ resource: "login", operation: "manage" }],
      [
        { resource: "login", operation: "manage" },
        { resource: "login", operation: "negate" },
      ],
    ),
  ).toBe(false);
});
