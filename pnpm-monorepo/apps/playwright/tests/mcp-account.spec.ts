import { expectAuditEvents } from "../fixtures/audit";
import { CIMD_CLIENT_NAME } from "../fixtures/cimd-server";
import { createCitizen, createMcpCitizen } from "../fixtures/factories";
import {
  clickUntilVisible,
  DELETED_TEXT,
  SAVED_TEXT,
  toggleLabel,
  waitForAppShellHydration,
} from "../fixtures/interactions";
import {
  modernMcpRequest,
  postMcpEndpoint,
  structuredContentOf,
  UNKNOWN_TOOL_ERROR_CODE,
} from "../fixtures/mcp-client";
import { expect, test } from "../fixtures/test";

const MCP_ACCOUNT_PAGE = "/app/account/mcp";

test.describe("the MCP account page", () => {
  test("the page lists a connected client, and its disconnection stops the client", async ({
    page,
    prisma,
    request,
    cimdServer,
    authorizeMcpClient,
  }) => {
    const citizen = await createMcpCitizen(prisma, { handle: "mcp-inhaber" });
    const authorization = await authorizeMcpClient(citizen.user);

    const callBefore = await postMcpEndpoint(
      request,
      modernMcpRequest("tools/list"),
      authorization.accessToken,
    );
    expect(callBefore.status()).toBe(200);

    await page.goto(MCP_ACCOUNT_PAGE);
    const clientRow = page
      .getByRole("row")
      .filter({ hasText: cimdServer.host });
    await expect(clientRow).toBeVisible();
    await expect(clientRow.getByText(CIMD_CLIENT_NAME)).toBeVisible();

    const dialog = page.getByRole("alertdialog", { name: "Client trennen?" });
    await clickUntilVisible(
      clientRow.getByRole("button", { name: `${cimdServer.host} trennen` }),
      dialog,
    );
    await dialog.getByRole("button", { name: "Trennen" }).click();
    await expect(page.getByText(DELETED_TEXT)).toBeVisible();
    await expect(
      page.getByText("Du hast noch keinen Client verbunden."),
    ).toBeVisible();

    const callAfter = await postMcpEndpoint(
      request,
      modernMcpRequest("tools/list"),
      authorization.accessToken,
    );
    expect(callAfter.status()).toBe(401);

    await expectAuditEvents(prisma, [
      "OAUTH_GRANT_CREATED",
      "OAUTH_GRANT_REVOKED",
    ]);
  });

  test("a disabled tool disappears from the clients until the user enables it again", async ({
    page,
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const citizen = await createMcpCitizen(prisma, {
      handle: "mcp-auswaehler",
    });
    const authorization = await authorizeMcpClient(citizen.user);
    const client = await connectMcpClient(authorization.accessToken);
    expect(await client.listToolNames()).toContain("get_current_user");

    await page.goto(MCP_ACCOUNT_PAGE);
    // One click for each change, because each click saves
    await waitForAppShellHydration(page);
    const toolSwitch = page.getByRole("checkbox", {
      name: "Get the current user",
    });
    await expect(toolSwitch).toBeChecked();

    await toggleLabel(page, toolSwitch).click();
    await expect(page.getByText(SAVED_TEXT)).toBeVisible();
    await expect(toolSwitch).not.toBeChecked();

    await expect
      .poll(() => client.listToolNames())
      .not.toContain("get_current_user");
    await expect(client.callTool("get_current_user")).rejects.toMatchObject({
      code: UNKNOWN_TOOL_ERROR_CODE,
    });

    await toggleLabel(page, toolSwitch).click();
    await expect(toolSwitch).toBeChecked();
    await expect
      .poll(() => client.listToolNames())
      .toContain("get_current_user");
    expect(
      (await client.callTool("get_current_user")).structuredContent,
    ).toMatchObject({ user_id: citizen.user.id });

    await expectAuditEvents(prisma, ["MCP_TOOL_SETTING_UPDATED"]);
  });

  test("only an admin in admin mode can enable admin mode for a client, and it gives the client all permissions", async ({
    page,
    prisma,
    cimdServer,
    authorizeMcpClient,
    connectMcpClient,
    enableAdminMode,
  }) => {
    const member = await createMcpCitizen(prisma, { handle: "mcp-mitglied" });
    const admin = await createMcpCitizen(prisma, {
      handle: "mcp-admin",
      admin: true,
    });
    const adminModeSwitch = page.getByRole("checkbox", {
      name: `Admin-Modus für ${cimdServer.host}`,
    });
    const clientRow = page
      .getByRole("row")
      .filter({ hasText: cimdServer.host });

    await authorizeMcpClient(member.user);
    await page.goto(MCP_ACCOUNT_PAGE);
    await expect(clientRow).toBeVisible();
    await expect(adminModeSwitch).toHaveCount(0);

    const authorization = await authorizeMcpClient(admin.user);
    const client = await connectMcpClient(authorization.accessToken);
    // Admin mode is off for a new client, also for an admin
    expect(
      (await client.callTool("get_current_user")).structuredContent,
    ).toMatchObject({ role: "admin", admin_mode: false });

    // The switch shows only while the admin mode of the toolbar is active
    await page.goto(MCP_ACCOUNT_PAGE);
    await expect(clientRow).toBeVisible();
    await expect(adminModeSwitch).toHaveCount(0);

    await enableAdminMode();
    await page.goto(MCP_ACCOUNT_PAGE);
    await expect(clientRow).toBeVisible();
    await waitForAppShellHydration(page);
    await expect(adminModeSwitch).not.toBeChecked();

    await toggleLabel(page, adminModeSwitch).click();
    await expect(adminModeSwitch).toBeChecked();

    await expect
      .poll(
        async () =>
          structuredContentOf(await client.callTool("get_current_user"))
            .admin_mode,
      )
      .toBe(true);

    await expectAuditEvents(prisma, ["OAUTH_GRANT_ADMIN_MODE_UPDATED"]);
  });

  test("an admin who assumes a user manages the clients and the tools of that user, but not their admin mode", async ({
    page,
    context,
    prisma,
    signIn,
  }) => {
    const admin = await createCitizen(prisma, {
      handle: "mcp-vertreter",
      admin: true,
    });
    const target = await createMcpCitizen(prisma, {
      handle: "mcp-vertretener",
    });
    await signIn(admin.user);
    await context.addCookies([
      {
        name: "assume_user",
        value: target.user.id,
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(MCP_ACCOUNT_PAGE);
    await expect(page.getByText("Assuming mcp-vertretener")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Verbundene Clients" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Admin-Modus" }),
    ).toHaveCount(0);
  });
});
