# Application

This package holds the use cases of SAM. A use case is one read or one write of a feature. The Next.js app and the MCP server call the same use cases. The package does not know Next.js, React or the MCP transport.

## Use cases

Each use case has this signature:

```ts
(context: ApplicationContext, actor: Actor, input: Input) => Promise<Output>;
```

- `context` gives the services of the app that runs the use case (the ports, `src/context.ts`): `prisma`, `audit`, `notifications`, `email`, `log`, `tracer`, `now`, `changelog`, `collab`, `discord`, `storage`, `images`, `urls`, `signingKey` and `allowInsecureLoopbackClientIds`. `changelog`, `collab`, `discord`, `storage` and `images` can be null. A use case that needs `changelog`, `collab` or the copy, a presigned URL or the list of `storage` then throws a `ConflictError`. A background step without `storage` or `images` skips with a warning. A null `discord` behaves like a Discord that cannot be reached: the result of the Discord step is Failed. The port `collab` has two calls: `replaceContent` replaces the content of a wiki page through the collab server, and `createSessionToken` signs the short-lived token of one editor connection. The shared implementations of the ports are in [`packages/infrastructure`](../infrastructure/README.md). The calls of `storage`, `email`, `images` and `changelog`:
  - `storage` reads an object (all bytes or a byte range), copies an object, gives the size of an object (`getObjectSize`), lists all objects (`listObjects`), deletes at most `MAXIMUM_STORAGE_DELETE_KEYS` objects in one call (`deleteObjects`) and makes the presigned upload and download URLs (`createUploadUrl`, `createDownloadUrl`).
  - `email` sends an `EmailRequest` (a template and its messages) to the email function (`request`).
  - `images` reads the displayed dimensions of an image from its first bytes, or from all bytes when the decoder needs them (`readDimensions`, `FIRST_IMAGE_BYTES_LENGTH`).
  - `changelog` gives the entries with their Markdown (`list`), and the keys and dates of the tracked entries without the Markdown (`listTrackedEntries`).
- `actor` is the user for whom the use case runs (`src/actor.ts`). The Next.js app builds it from the session, the MCP server from the access token.
- A use case without a user, for example the public token endpoint of the OAuth server, takes `(context, input)`.
- The use cases of a feature live in `src/<feature>/` with a barrel `index.ts` that the package index re-exports.

Obey these rules:

- **One schema.** Export the Zod input schema next to the use case. The caller parses the input with this schema: the server action parses its `FormData`, the MCP tool shows the schema to the client. The use case does not parse the input again.
- **Plain output.** Give each use case an explicit output type. Never return a Prisma row: select the fields and map them to the output type. A write gives the object after the write, in the shape of the read of the same object. Give the bare object, and `{ <object>, notifications_sent }` only when the write sends notifications (see "Side effects").
- **App-only options.** An option that only the app can give (for example an upload, a template or the Discord sync of the events: `CreateEventOptions`, `UpdateEventOptions`, `DeleteEventOptions`, and `PageOptions` of the lists) is a fourth parameter, not a field of the input schema. The MCP tools call the use case without it.
- **Key case.** The input schemas and the outputs that the MCP tools use have lowercase snake_case keys. The outputs that only the app uses have camelCase keys.
- **Shared schemas.** Take the page size, the cursor and the ids from `src/pagination.ts` (`pageLimitSchema`, `cursorSchema`, `idSchema`), and the times from `src/dateTime.ts` (`dateTimeInputSchema`: an ISO 8601 instant, or a wall time in the time zone of the organization, which the forms of the app send). Take the limits that the forms of the app also need (lengths, caps) from the `domain` package. A list that sorts in memory pages with `paginateByCursor()`, which refuses an unknown cursor with a `ValidationError`. A list that the database sorts pages with `paginateByDatabaseCursor()`, with the id of a row as the cursor. It checks that the cursor exists in the same way as `paginateByCursor()`. A list that the app pages in both directions takes a `PageOptions` parameter, not fields in its input schema: the direction, and `UnknownCursorBehavior.FirstPage` for the stale cursors in the URLs of the app.
- **Typed errors.** Throw the errors of `src/errors.ts`: `ForbiddenError`, `NotFoundError`, `ConflictError` and `ValidationError`. Write a short English message. Do not use translated strings: each app maps the errors to its own response. When an app shows its own text for a message, the message is a member of a message enum of the feature (for example `EventErrorMessage`, `LineupErrorMessage`, `TaskErrorMessage`), thrown through the base classes. The Next.js app maps the errors with `mapApplicationErrorToActionResponse()` and a record of texts by message; a not-found error and a conflict refresh the page. A write whose record can go away after the read (the Prisma error P2025) runs in `rethrowRecordNotFound()`, which throws a `NotFoundError` with the message of the feature.
- **Permissions in the use case.** The caller does the gate of the app (`actor.requireClearance()`). The use case checks the permissions of its operation with `requirePermission(actor, resource, operation, attributes)`, or with `actor.authorize()` when the result changes the output.
- **Side effects in the use case.** Write the audit events with `context.audit.create()`. Send the notifications after the save with `triggerNotificationsAfterSave()` (`src/notifications.ts`): a failure does not make the result an error, the output gives `notifications_sent: false` instead, and the caller shows a warning. Use `context.now()` for the current time.
- **No framework imports.** Never import `next`, `next/*`, `react`, `react-dom`, `server-only` or a module of the app (`@/…`). The test `src/boundaries.test.ts` fails on such an import.
- **No React `cache()`.** The app wraps a read use case with `cache()` where a page needs the deduplication per request.
- **Spans.** Use `withSpan(context, name, callback)` for async work that is slow or that has many steps.
- **Automations.** A job of a Lambda function is a use case with the signature `(context)`. It reads the clock with `context.now()`, thus a test sets the time through the test context. The output holds the counts for the log of the host. The audit events have `createdById: null`. The automation lives in the folder of its feature (for example `roles/removeExpiredRoleAssignments.ts`, `silc/disburseRoleSalaries.ts` and `profitDistribution/endDueCollectionPhases.ts`).

Example:

```ts
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";

export const renameShipInputSchema = z.object({
  ship_id: idSchema,
  name: z.string().trim().max(255).describe("An empty name removes the name."),
});

export interface RenameShipOutput {
  readonly id: string;
  readonly name: string;
}

export const renameShip = async (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof renameShipInputSchema>,
): Promise<RenameShipOutput> => {
  requirePermission(actor, "ship", "manage");
  // Load the ship, throw a NotFoundError when it is missing, update it,
  // write the audit event, and return the output type.
};
```

## File layout

```
src/
  actor.ts                 Actor, createActor(), requirePermission(), requireCitizen()
  context.ts               ApplicationContext, its ports and createApplicationUrls()
  errors.ts                the typed errors and rethrowRecordNotFound()
  pagination.ts            the shared page size, cursor and id schemas, paginateByCursor(), paginateByDatabaseCursor()
  dateTime.ts              the shared date-time input schema
  notifications.ts         triggerNotificationsAfterSave()
  mcpAccess.ts             the permission that gates the MCP server
  citizenReference.ts      the citizen in the outputs
  withSpan.ts              the span helper
  auth/                    the effective roles of a citizen (the session and the MCP principal), the sessions, the email confirmation and the admin toolbar
  oauth/                   the use cases of the OAuth authorization server
  <feature>/<useCase>.ts   one use case per file, with its input schema and its output type
  <feature>/index.ts       the barrel of the feature
  index.ts                 the exports of the package: the barrels and the shared modules
```

## Exceptions

These exports are not use cases. No MCP tool calls them:

- The `find…` row helpers (for example `findEventListPage`, `findEventOptions`, `findResolvedEventParticipants`, `findOwnEventParticipation`, `findEventActivityRows`, `findAddableEventParticipantIds`, `findEventPositionTree`, `findEventLineupCitizens`, `findEventTemplateDetails`, `findEventTemplatePositionTree`, `findVisibleTask`, `findManagedRole`, `findRoleTableRows`, `findSpynetCitizen`, `findNoteTablePage`, `findUserListPage`, `findSilcTransactionTablePage`, `findRoleSalaryRows`, `findProfitDistributionCycleDetails` and `findOwnOpenTaskRows`) give rows only to the renderers of the app.
- `findAllRoleBadges` has no permission check. Its callers check the permission.
- `findRolesForSalaries` and `getAuecConversionRate` take no actor and check no permission. The settings page and the SILC dashboard check the permission, and the conversion rate is not personal. `findRolesForSalaries` keeps a known gap: its tRPC procedure checks only the clearance, and its output holds roles that the caller cannot see. Whether to close the gap is an open decision.
- `filterLeaderboardMembers` takes the ranks of the leaderboard of the Roberts Space Industries website as host data (the interface `LeaderboardRank`, no schema). The host reads and validates the ranks.
- `linkCitizenOfSignedInUser` and `hasBirthdayTodaySafely` (the Spynet) are helpers for the auth zone; `deletePermissionStringsReferencing` (the roles) is a helper for the settings of the Spynet. They carry no permission check: the caller checks it.
- The wiki scope entry points (`buildWikiContext`, `buildBriefingWikiContext`, `buildVariantWikiContext`, `loadWikiScopeOfPage` and `findReadableWikiScope`) take `(context, actor, …)`, but they are not use cases: they give the scope or null, and the caller gives its own not-found answer. `toWikiScopeTarget` turns the scope input of the tRPC procedures (`wikiScopeInputSchema`) into the target of `findReadableWikiScope`. Inside the package, the use cases load the scope of a page with `requireWikiPageOfScope()`, which throws the not-found and the forbidden answers itself.
- The wiki `find…` helpers (`findWikiPageDetails`, `findWikiPageReportRows`, `findWikiPageReport`, `countOpenWikiReports`, `findWikiRoleCitizens`, `findWikiLinkablePages`, `findWikiPageIndex`, `findOwnWikiFavoritePageIds`, `findOwnRecentWikiPageIds`, `findWikiScopeTags`, `findWikiSearchResults` and `findWikiAttachmentDownload`) give rows only to the pages, the tRPC procedures and the routes of the app. Their citizens have one shape, `WikiCitizen`.
- `findWikiPermissionRoles`, `findWikiSettings` and `findWikiPageLinkTarget` take no actor and check no permission. The callers check it.
- `loadEffectivePermissionsOfCitizens` takes no actor and checks no permission. It gives the effective roles and permission sets of the citizens that match a Prisma filter. The notification router of the Lambda functions uses it to find the recipients, and the wiki mention job uses it for the read check of each mentioned citizen.
- `findWikiPageContent`, `findWikiPageOwner`, `findWikiPageTags`, `findWikiPageSnapshotRows` and `findWikiTagPages` are scope helpers. They take a wiki scope that the caller loaded for the same actor (the scope entry points above). They check the access in this scope themselves: a check of the read tier (`findWikiPageContent`, `findWikiPageOwner` and `findWikiPageTags`) or of the admin tier (`findWikiPageSnapshotRows`) that throws a `NotFoundError`, or a filter that leaves out the pages that the actor cannot read (`findWikiTagPages`).
- `canAccessEventTemplates` and `canReadEventBriefing` are boolean checks for the pages and the tiles of the app, not reads. `canReadEventBriefing(context, actor, event)` takes a row of the event list, and its caller has checked `event;read`.
- `validateWikiIframeSrc` ignores the actor: the allowlist of the iframe hosts is not personal. The caller checks the clearance.
- `findPublishableDiscordChannels` takes no actor and checks no permission. The callers check it. It gives null when Discord cannot be reached.
- `syncEventDiscordPublication` checks no permission until the upload route of the cover image becomes a use case. The route checks that the actor can manage the event.
- `publishEventToDiscord` and `unpublishEventFromDiscord` are for the app only: their output `DiscordSyncResult` tells which Discord step failed. `createEvent`, `updateEvent` and `deleteEvent` give such a result in the optional output field `discord`, only when the caller gives their app-only option. Without the option the key does not exist, because the MCP tools parse the output with a strict schema.

These use cases run without an actor. No MCP tool calls them:

- The admin toolbar (`startAssumingUser`, `stopAssumingUser` and `listAssumableUsers`) takes the id of the admin as input. During an assume, the actor is the assumed user, thus the host keeps the admin gate. A different host must not call them without a check of its own.
- The development login (`findDevelopmentLoginUser` and `listDevelopmentLoginUsers`) and `findSessionIdByToken` run without a session. The host checks the environment and reads the cookie.
- `confirmEmailWithToken` is public: the token is the proof.
- The Human Resources reads of the clearance page (`getHumanResourcesRoleIds` and `listHumanResourcesContacts`) run for users who have no clearance yet.

## Tests

Write unit tests (Vitest, `*.test.ts` next to the file) only for complex or critical logic. Test the behavior through the end-to-end tests of the apps.

The integration tests (`*.integration.test.ts`) run against a Postgres testcontainer (`test/postgres.ts`, Docker must run). The package also holds the helper that empties the database (`test/database.ts`) and the helper that makes two sessions wait for the same locks (`test/locks.ts`). The test factory of the context (`createTestApplicationContext()` in `test/applicationContext.ts`) records the audit events, the notifications and the email requests. `createTestStorage()` (`test/storage.ts`) gives an object storage that records the deletes and the presigned URLs. The Lambda functions use the same helpers through `@sam-monorepo/application/test/*` until their tests move into this package.

## Add a feature

1. Add `src/<feature>/<useCase>.ts` with the input schema, the output type and the use case. Export them from the barrel `src/<feature>/index.ts`. The package index re-exports the barrel.
2. Next.js app: the composition root is `apps/app/src/modules/application`. A server action parses the `FormData` with the schema, calls the use case with `getApplicationContext()` and `await toActor(authentication.session)`, keeps its `refresh()`, and maps the errors with `mapApplicationErrorToActionResponse()` and the texts of the feature. Pages and queries get the actor with `getRequestActor()` and map the errors with `throwApplicationErrorForPage()`. tRPC procedures call the read use cases with `toActor(ctx.session)`.
3. MCP server: add a tool that shows the input schema and calls the use case.

## Modules that are not on use cases yet

The modules of the app that [the Prisma rule](../../../docs/architecture.md#inside-the-nextjs-app) does not list still hold their logic. They move later, feature group by feature group.
