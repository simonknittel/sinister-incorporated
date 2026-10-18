import type { AuditEvent, PrismaClient } from "@sam-monorepo/database/client";
import { createMcpCitizen, ONE_MINUTE_MS } from "../fixtures/factories";
import {
  callForContent,
  UNKNOWN_TOOL_ERROR_CODE,
} from "../fixtures/mcp-client";
import { expect, test } from "../fixtures/test";

const TOOL_NAME = "list_audit_events";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * ONE_MINUTE_MS);

/**
 * Creates four events with distinct times, from the oldest to the newest:
 * a task by the viewer, a ship without a creator, a task by a colleague and
 * a high-volume wiki visit by the viewer. The returned window contains only
 * these events. The stack writes events of its own at the current time (the
 * login and the OAuth grant of the viewer), and the window ends before them.
 */
const seedAuditEvents = async (
  prisma: PrismaClient,
  {
    viewerUserId,
    viewerCitizenId,
    colleagueUserId,
  }: {
    readonly viewerUserId: string;
    readonly viewerCitizenId: string;
    readonly colleagueUserId: string;
  },
) => {
  const taskOfViewer = await prisma.auditEvent.create({
    data: {
      type: "TASK_CREATED",
      data: { taskIds: ["task-a"], visibility: "PUBLIC", rewardType: "TEXT" },
      createdById: viewerUserId,
      createdAt: minutesAgo(40),
    },
  });
  const ship = await prisma.auditEvent.create({
    data: {
      type: "SHIP_CREATED_V2",
      data: { shipId: "ship-a", ownerId: "citizen-a", variantId: "variant-a" },
      createdById: null,
      createdAt: minutesAgo(30),
    },
  });
  const taskOfColleague = await prisma.auditEvent.create({
    data: {
      type: "TASK_CREATED",
      data: { taskIds: ["task-b"], visibility: "PUBLIC", rewardType: "TEXT" },
      createdById: colleagueUserId,
      createdAt: minutesAgo(20),
    },
  });
  const wikiVisit = await prisma.auditEvent.create({
    data: {
      type: "WIKI_PAGE_VISITED",
      data: { pageId: "page-a", citizenId: viewerCitizenId },
      createdById: viewerUserId,
      createdAt: minutesAgo(10),
    },
  });

  return {
    taskOfViewer,
    ship,
    taskOfColleague,
    wikiVisit,
    window: {
      from: minutesAgo(45).toISOString(),
      to: minutesAgo(5).toISOString(),
    },
  };
};

/** Matches the events with these ids in this order, and no other event */
const eventsWithIds = (...auditEvents: readonly AuditEvent[]) => ({
  events: auditEvents.map((auditEvent) => ({ id: auditEvent.id })),
});

test.describe("the list_audit_events tool of the MCP server", () => {
  test("only a citizen with systemLog;read has the tool", async ({
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const reader = await createMcpCitizen(prisma, {
      handle: "mcp-protokoll-leser",
      permissionStrings: ["systemLog;read"],
    });
    const member = await createMcpCitizen(prisma, {
      handle: "mcp-ohne-protokoll",
    });

    const readerClient = await connectMcpClient(
      (await authorizeMcpClient(reader.user)).accessToken,
    );
    expect(await readerClient.listToolNames()).toContain(TOOL_NAME);

    const memberClient = await connectMcpClient(
      (await authorizeMcpClient(member.user)).accessToken,
    );
    expect(await memberClient.listToolNames()).not.toContain(TOOL_NAME);
    await expect(memberClient.callTool(TOOL_NAME)).rejects.toMatchObject({
      code: UNKNOWN_TOOL_ERROR_CODE,
    });
  });

  test("the events come newest first, the high-volume types need a request, and the filters narrow the events", async ({
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const viewer = await createMcpCitizen(prisma, {
      handle: "mcp-protokoll-betrachter",
      permissionStrings: ["systemLog;read"],
    });
    const colleague = await createMcpCitizen(prisma, {
      handle: "mcp-protokoll-kollege",
    });
    const { taskOfViewer, ship, taskOfColleague, wikiVisit, window } =
      await seedAuditEvents(prisma, {
        viewerUserId: viewer.user.id,
        viewerCitizenId: viewer.entity.id,
        colleagueUserId: colleague.user.id,
      });
    const client = await connectMcpClient(
      (await authorizeMcpClient(viewer.user)).accessToken,
    );

    // Without a filter for the types, the wiki visit is hidden
    expect(await callForContent(client, TOOL_NAME, window)).toEqual({
      events: [
        {
          id: taskOfColleague.id,
          type: "TASK_CREATED",
          created_at: taskOfColleague.createdAt.toISOString(),
          created_by: {
            user_id: colleague.user.id,
            name: "mcp-protokoll-kollege",
          },
          data: {
            taskIds: ["task-b"],
            visibility: "PUBLIC",
            rewardType: "TEXT",
          },
        },
        {
          id: ship.id,
          type: "SHIP_CREATED_V2",
          created_at: ship.createdAt.toISOString(),
          created_by: null,
          data: {
            shipId: "ship-a",
            ownerId: "citizen-a",
            variantId: "variant-a",
          },
        },
        {
          id: taskOfViewer.id,
          type: "TASK_CREATED",
          created_at: taskOfViewer.createdAt.toISOString(),
          created_by: {
            user_id: viewer.user.id,
            name: "mcp-protokoll-betrachter",
          },
          data: {
            taskIds: ["task-a"],
            visibility: "PUBLIC",
            rewardType: "TEXT",
          },
        },
      ],
      next_cursor: null,
    });

    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        include_high_volume: true,
      }),
    ).toMatchObject(
      eventsWithIds(wikiVisit, taskOfColleague, ship, taskOfViewer),
    );
    // A filter for the types shows the named types, also the high-volume ones
    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        types: ["WIKI_PAGE_VISITED"],
      }),
    ).toMatchObject(eventsWithIds(wikiVisit));
    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        types: ["TASK_CREATED"],
      }),
    ).toMatchObject(eventsWithIds(taskOfColleague, taskOfViewer));

    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        created_by_user_ids: [viewer.user.id],
      }),
    ).toMatchObject(eventsWithIds(taskOfViewer));
    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        created_by_user_ids: [viewer.user.id],
        include_high_volume: true,
      }),
    ).toMatchObject(eventsWithIds(wikiVisit, taskOfViewer));

    // The start of the time range is inclusive, the end is exclusive
    expect(
      await callForContent(client, TOOL_NAME, {
        from: ship.createdAt.toISOString(),
        to: taskOfColleague.createdAt.toISOString(),
      }),
    ).toMatchObject(eventsWithIds(ship));
  });

  test("a cursor gives the next page of the same filter, and the last page has no cursor", async ({
    prisma,
    authorizeMcpClient,
    connectMcpClient,
  }) => {
    const viewer = await createMcpCitizen(prisma, {
      handle: "mcp-protokoll-blaetterer",
      permissionStrings: ["systemLog;read"],
    });
    const colleague = await createMcpCitizen(prisma, {
      handle: "mcp-protokoll-nachbar",
    });
    const { taskOfViewer, ship, taskOfColleague, window } =
      await seedAuditEvents(prisma, {
        viewerUserId: viewer.user.id,
        viewerCitizenId: viewer.entity.id,
        colleagueUserId: colleague.user.id,
      });
    const client = await connectMcpClient(
      (await authorizeMcpClient(viewer.user)).accessToken,
    );

    const firstPage = await callForContent(client, TOOL_NAME, {
      ...window,
      limit: 1,
    });
    expect(firstPage).toMatchObject(eventsWithIds(taskOfColleague));
    expect(firstPage.next_cursor).toEqual(expect.any(String));

    const secondPage = await callForContent(client, TOOL_NAME, {
      ...window,
      limit: 1,
      cursor: firstPage.next_cursor,
    });
    expect(secondPage).toMatchObject(eventsWithIds(ship));
    expect(secondPage.next_cursor).toEqual(expect.any(String));

    expect(
      await callForContent(client, TOOL_NAME, {
        ...window,
        limit: 1,
        cursor: secondPage.next_cursor,
      }),
    ).toMatchObject({ ...eventsWithIds(taskOfViewer), next_cursor: null });
  });
});
