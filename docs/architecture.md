# Architecture

This document tells where the code lives today, where it moves to, and the rules that keep the direction. It is a living document: update it when a package or a layer changes.

## Current layout

The monorepo (`pnpm-monorepo`) has two groups of workspace packages.

### Hosts (`apps/*`)

A host is a deployable program. It owns its runtime, its configuration and its entry points.

| Host | Runtime | Role |
| - | - | - |
| `apps/app` | Next.js on Vercel | The web app: pages, server actions, tRPC, route handlers, the login (next-auth), the OAuth authorization server and the MCP endpoint |
| `apps/lambda` | AWS Lambda | Automations and the notification router: `email-function`, `frequent-automations`, `midnight-automations`, `notification-router`, `scrape-discord-events` |
| `apps/collab` | Node.js container | The realtime backend of the wiki (Hocuspocus) |
| `apps/scripts` | Node.js | One-off maintenance scripts |
| `apps/playwright` | Node.js | The end-to-end test suite with its own stack |

### Shared packages (`packages/*`)

| Package | Layer | Content | Depends on |
| - | - | - | - |
| `database` | infrastructure | The Prisma schema, the migrations and the generated client | — |
| `domain` | domain | Pure rules and helpers that more than one host uses: audit event types, calendar dates, time zone, event rules, wiki rules, read markers, the limits of the forms and the use cases, the slug helper. The permission model (`src/permissions`): permission sets, role resolution, the wiki page permission resolvers. The notification vocabulary (`src/notifications`): the payload schemas of the on-site notifications and the realtime channel names | `database` (types) |
| `emails` | domain | The email templates | — |
| `wiki-editor` | domain | The Tiptap schema of the wiki content, text extraction, the Markdown renderer and parser | — |
| `application` | use cases | The use cases: one read or one write of a feature, with the permission checks, the audit events and the notifications inside. The actor, the application context and the typed errors. The OAuth use cases. See the [package README](../pnpm-monorepo/packages/application/README.md). | `database`, `domain`, `wiki-editor`. Never `infrastructure` or `mcp`. |
| `infrastructure` | infrastructure | The shared implementations of the ports of `application`: the Prisma audit writer, and the EventBridge client, emitter and notification trigger. See the [package README](../pnpm-monorepo/packages/infrastructure/README.md). | `application` (the port types), `database`, the AWS SDK |
| `mcp` | interface adapter | The MCP server: the tool registry, the tools, the request handler with the bearer verification. See [mcp-server.md](./mcp-server.md). | `application`, `domain`, `database` |

### Inside the Next.js app

`apps/app/src/modules/<feature>/` holds the code of a feature: `queries/` (reads), `actions/` (server actions, the writes), `components/`, `utils/`. `apps/app/src/app/` holds the routes and the pages, which compose the modules.

Four modules are adapters of the packages, not features:

- `modules/application`: the composition root. `getApplicationContext()` builds the one context of the app. The audit port comes from `infrastructure`. The other ports come from the modules of the app (Prisma, notifications, logging, tracing, changelog, collab, URLs, signing key); the notification trigger of the app wraps the one of `infrastructure`. `toActor(session)` maps the next-auth session to the actor of the use cases, and `getRequestActor()` gives the actor of the current request to the pages and queries. Two helpers map the typed errors to action responses and to `forbidden()` / `notFound()`.
- `modules/oauth`: the consent page, the token and revocation endpoints and the metadata documents.
- `modules/mcp`: the `/api/mcp` route.
- `modules/mcp-settings`: the account page `/app/account/mcp` (the connected clients and the tool settings).

Where a feature already has use cases, the module keeps a thin wrapper per query or action: it builds the actor from the session, calls the use case, and keeps the app-specific parts (React `cache()`, `FormData` parsing, translations, `refresh()`, `forbidden()`).

**The Prisma rule.** The ESLint configuration object `use-cases-only` in `apps/app/eslint.config.mjs` forbids `@/db` and the `prisma` client of `@sam-monorepo/database` in the modules that are on use cases. Types from `@sam-monorepo/database/client` and enums from `@sam-monorepo/database/browser` stay permitted. The list of modules grows with each milestone of the move. At the end it covers `src/**`, except the composition root (`modules/application`) and the auth zone (`modules/auth/server`).

### Inside the Lambda functions

The composition root is `apps/lambda/src/common/createApplicationContext.ts`. It uses the audit writer and the EventBridge adapters of `infrastructure`. The context has the no-op tracer of OpenTelemetry, because the functions register no tracer provider: X-Ray stays at the level of the handlers and the jobs, and the spans of the use cases are lost. The context has no changelog, no collab server and no signing key. No function calls the composition root until its first use case arrives.

### Tests

See the [Tests section of the application README](../pnpm-monorepo/packages/application/README.md#tests) for the unit tests and the integration tests.

## Target architecture

The direction is a pragmatic reading of Clean Architecture. The rules of the organization and the use cases of the system are independent of the hosts. A host is a thin adapter: it authenticates, builds the actor and the context, calls a use case, and shapes the response for its transport.

```mermaid
flowchart TB
  subgraph hosts [Hosts]
    app["apps/app (Next.js)"]
    lambda["apps/lambda"]
    mcpService["MCP service (later)"]
    backend["Backend (later)"]
  end

  subgraph adapters [Adapters]
    nextAdapters["Server actions, tRPC, route handlers"]
    lambdaHandlers["Lambda handlers"]
    mcp["packages/mcp"]
    controllers["HTTP controllers"]
  end

  subgraph useCases [Use cases]
    application["packages/application"]
  end

  subgraph domain [Domain]
    domainPackages["packages/domain, emails, wiki-editor"]
  end

  subgraph infrastructure [Infrastructure]
    infrastructurePackage["packages/infrastructure (ports)"]
    database["packages/database (Prisma)"]
  end

  app --> nextAdapters
  app --> mcp
  lambda --> lambdaHandlers
  mcpService --> mcp
  backend --> controllers
  nextAdapters --> application
  lambdaHandlers --> application
  mcp --> application
  controllers --> application
  app --> infrastructurePackage
  lambda --> infrastructurePackage
  infrastructurePackage -. port types .-> application
  infrastructurePackage --> database
  application --> domainPackages
  application --> database
  domainPackages --> database
```

Dependencies point downwards only. The one exception is the dotted edge: `infrastructure` imports the port types of `application`, so that each host can pass the implementations to the use cases. A package never imports a host. `application` never imports `infrastructure`, `mcp` or `next`. `domain` never imports `application`.

### The layers

- **Domain** (`domain`, `emails`, `wiki-editor`): pure code. No Prisma client calls, no I/O. Prisma types and selects are permitted.
- **Use cases** (`application`): `(context, actor, input) => output`, with the context and its ports as the [package README](../pnpm-monorepo/packages/application/README.md) describes them. The use cases call Prisma directly; there are no repository ports. This is the one intentional break of the dependency rule, decided for pragmatism.
- **Adapters**: the server actions and tRPC procedures of the Next.js app, the MCP tools and request handler, the Lambda handlers. They parse the transport-specific input, call the use cases and map the typed errors.
- **Infrastructure** (`database`, `infrastructure`): the Prisma schema and client, and the shared implementations of the ports. Each host composes the implementations in its composition root.
- **Hosts**: the deployables. Each host has one composition root that builds its context.

### What moves, and where to

| Today | Target | Why |
| - | - | - |
| Business logic in `apps/app/src/modules/*/actions` and `queries` | Use cases in `application`; the app keeps thin wrappers | The MCP server, the Lambdas and a later backend call the same logic |
| The audit writer and the EventBridge adapters in `apps/app` and `apps/lambda` | Done: shared in `infrastructure`; each host composes them in its context | The later MCP service and the backend need the same services |
| The logger and the tracer in `apps/app/src/modules` | Stay per host; each host adapts them in its context | The app logs in `after()`, the Lambda functions log to the console |
| Permission checks in pages and components | Inside the use cases; the pages keep their gates as a second check | A new host cannot forget a check that the use case does |
| Lambda automations that use Prisma and the app's rules | Use cases in `application`, called from thin Lambda handlers | One implementation of each rule |
| The MCP endpoint in `apps/app` | A service of its own that imports `mcp` and `application` and builds its own context | Independent scaling and deployment |
| The Next.js app with all business logic | A dedicated backend with Next.js as a backend-for-frontend (open decision) | Only when a second frontend or a scaling need makes it necessary |
| `packages/permissions` | Done: folded into `domain` (`src/permissions`) | It is domain code with the same dependencies as `domain`; one package has less to maintain. |
| `packages/notifications` | Done: folded into `domain` (`src/notifications`) | Same reason as `permissions`. |
| `packages/wiki-editor` | Stays a separate domain-level package | It is domain code (the content format of the wiki), but it depends on Tiptap and has a browser entry (`helpers`). A merge into `domain` would pull Tiptap into the Lambdas and the collab server. |
| `packages/emails` | Stays separate as an adapter | Email templates are presentation, not rules. A use case asks the context to send a notification; the template renders it. |

### How to move a piece of logic

1. Put the pure rules into `domain` (or the fitting domain package) if the Lambdas or the collab server could use them.
2. Write the use case in `application/src/<feature>/`: the Zod input schema next to it, an explicit plain output, the permission checks with `requirePermission`, the audit events and the notifications through the context.
3. Make the app query or action a thin wrapper: the same export name and signature where practical, the actor from the session, the use case call, the app-specific response.
4. Delete the moved logic from the app. Never keep two copies.
5. Keep the end-to-end tests green without changes: the behavior of the app does not change.
