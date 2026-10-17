import { createCitizen, createRole } from "../fixtures/factories";
import {
  structuredContentOf,
  toolResultText,
  type McpTestClient,
} from "../fixtures/mcp-client";
import { expect, test } from "../fixtures/test";

const NOT_FOUND_RESULT = /^NotFoundError: /;

/** The structured content of a tool result that must not be an error */
const callForContent = async (
  client: McpTestClient,
  name: string,
  toolArguments?: Record<string, unknown>,
) => {
  const result = await client.callTool(name, toolArguments);
  expect(result.isError, toolResultText(result)).toBeFalsy();

  return structuredContentOf(result);
};

/** The message of a tool result that must be an error */
const callForError = async (
  client: McpTestClient,
  name: string,
  toolArguments?: Record<string, unknown>,
) => {
  const result = await client.callTool(name, toolArguments);
  expect(result.isError).toBe(true);

  return toolResultText(result);
};

test.describe("the role tools of the MCP server", () => {
  test("list_roles gives only the roles with otherRole;read for their id, and get_role does not find a hidden role", async ({
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const scout = await prisma.role.create({
      data: { name: "Aufklärer", description: "**Späher**", maxLevel: 3 },
    });
    const salvage = await createRole(prisma, { name: "Bergung" });
    const command = await prisma.role.create({
      data: {
        name: "Kommando",
        inherits: { connect: [{ id: scout.id }, { id: salvage.id }] },
      },
    });
    const viewer = await createCitizen(prisma, {
      handle: "mcp-rollen-betrachter",
      permissionStrings: [
        `otherRole;read;roleId=${command.id}`,
        `otherRole;read;roleId=${scout.id}`,
      ],
    });
    const client = await connectMcpClient(
      (await authorizeMcpClient(viewer.user)).accessToken,
    );

    expect(await client.listToolNames()).toEqual(
      expect.arrayContaining(["get_role", "list_roles"]),
    );

    // The own role of the viewer and the role "Bergung" are hidden, also as
    // an inherited role
    expect(await callForContent(client, "list_roles")).toEqual({
      roles: [
        {
          id: scout.id,
          name: "Aufklärer",
          description: "**Späher**",
          icon_url: null,
          max_level: 3,
          inherited_role_ids: [],
        },
        {
          id: command.id,
          name: "Kommando",
          description: null,
          icon_url: null,
          max_level: null,
          inherited_role_ids: [scout.id],
        },
      ],
      next_cursor: null,
    });

    const firstPage = await callForContent(client, "list_roles", { limit: 1 });
    expect(firstPage).toMatchObject({
      roles: [{ id: scout.id }],
      next_cursor: scout.id,
    });
    expect(
      await callForContent(client, "list_roles", {
        limit: 1,
        cursor: firstPage.next_cursor,
      }),
    ).toMatchObject({ roles: [{ id: command.id }], next_cursor: null });

    expect(
      await callForContent(client, "list_roles", { query: "KOMM" }),
    ).toMatchObject({ roles: [{ id: command.id }] });

    expect(
      await callForError(client, "get_role", { role_id: salvage.id }),
    ).toMatch(NOT_FOUND_RESULT);
  });

  test("get_role gives the permission strings only with role;manage", async ({
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const logistics = await createRole(prisma, {
      name: "Logistik",
      permissionStrings: ["ship;read", "event;read"],
    });
    await prisma.role.update({
      where: { id: logistics.id },
      data: { maxAgeDays: 30 },
    });
    const reader = await createCitizen(prisma, {
      handle: "mcp-rollen-leser",
      permissionStrings: [`otherRole;read;roleId=${logistics.id}`],
    });
    const manager = await createCitizen(prisma, {
      handle: "mcp-rollen-verwalter",
      permissionStrings: [
        "role;manage",
        `otherRole;read;roleId=${logistics.id}`,
      ],
    });
    const expectedRole = {
      id: logistics.id,
      name: "Logistik",
      description: null,
      icon_url: null,
      max_level: null,
      inherited_role_ids: [],
      max_age_days: 30,
      assign_after_inactive_days: null,
    };

    const readerClient = await connectMcpClient(
      (await authorizeMcpClient(reader.user)).accessToken,
    );
    expect(
      await callForContent(readerClient, "get_role", {
        role_id: logistics.id,
      }),
    ).toEqual({ ...expectedRole, permission_strings: null });

    const managerClient = await connectMcpClient(
      (await authorizeMcpClient(manager.user)).accessToken,
    );
    expect(
      await callForContent(managerClient, "get_role", {
        role_id: logistics.id,
      }),
    ).toEqual({
      ...expectedRole,
      permission_strings: ["event;read", "ship;read"],
    });
  });
});
