# Application

This package holds the use cases of SAM. A use case is one read or one write of a feature. The Next.js app and the MCP server call the same use cases. The package does not know Next.js, React or the MCP transport.

## Use cases

Each use case has this signature:

```ts
(context: ApplicationContext, actor: Actor, input: Input) => Promise<Output>;
```

- `context` gives the services of the app that runs the use case: the Prisma client, the audit events, the notifications, the logger, the tracer, the clock, the changelog, the collab server, the URLs and the signing key (`src/context.ts`).
- `actor` is the user for whom the use case runs (`src/actor.ts`). The Next.js app builds it from the session, the MCP server from the access token.
- A use case without a user, for example the public token endpoint of the OAuth server, takes `(context, input)`.
- The use cases of a feature live in `src/<feature>/` with a barrel `index.ts` that the package index re-exports.

Obey these rules:

- **One schema.** Export the Zod input schema next to the use case. The caller parses the input with this schema: the server action parses its `FormData`, the MCP tool shows the schema to the client. The use case does not parse the input again.
- **Plain output.** Give each use case an explicit output type. Never return a Prisma row: select the fields and map them to the output type.
- **Typed errors.** Throw the errors of `src/errors.ts`: `ForbiddenError`, `NotFoundError`, `ConflictError` and `ValidationError`. Write a short English message. Do not use translated strings: each app maps the errors to its own response.
- **Permissions in the use case.** The caller does the gate of the app (`actor.requireClearance()`). The use case checks the permissions of its operation with `requirePermission(actor, resource, operation, attributes)`, or with `actor.authorize()` when the result changes the output.
- **Side effects in the use case.** Write the audit events with `context.audit.create()` and send the notifications with `context.notifications.trigger()`. Use `context.now()` for the current time.
- **No framework imports.** Never import `next`, `next/*`, `react`, `react-dom`, `server-only` or a module of the app (`@/…`). The test `src/boundaries.test.ts` fails on such an import.
- **No React `cache()`.** The app wraps a read use case with `cache()` where a page needs the deduplication per request.
- **Spans.** Use `withSpan(context, name, fn)` for async work that is slow or that has many steps.

Example:

```ts
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";

export const renameShipInputSchema = z.object({
  shipId: z.cuid(),
  name: z.string().trim().min(1).max(255),
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
  actor.ts                 Actor, createActor(), requirePermission()
  context.ts               ApplicationContext and its ports
  errors.ts                the typed errors
  withSpan.ts              the span helper
  <feature>/<useCase>.ts   one use case per file, with its input schema and its output type
  index.ts                 the exports of the package
```

## Tests

Write unit tests (Vitest, `*.test.ts` next to the file) only for complex or critical logic. Test the behavior through the end-to-end tests of the apps.

## Add a feature

1. Add `src/<feature>/<useCase>.ts` with the input schema, the output type and the use case. Export them from `src/index.ts`.
2. Next.js app: the composition root is `apps/app/src/modules/application`. A server action parses the `FormData` with the schema, calls the use case with `getApplicationContext()` and `await toActor(session)`, keeps its `refresh()`, and maps the errors with `mapApplicationErrorToActionResponse()`. Pages and tRPC procedures call the read use cases.
3. MCP server: add a tool that shows the input schema and calls the use case.

## Follow-up

The actions and queries of the app that no MCP tool uses stay in the app for now. They move into this package later.
