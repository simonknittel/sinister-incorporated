# Infrastructure

This package holds the shared implementations of the ports of the use cases. The ports are the fields of `ApplicationContext` in [`application/src/context.ts`](../application/src/context.ts). Each host composes the implementations in its composition root: the Next.js app in `apps/app/src/modules/application`, the Lambda functions in `apps/lambda/src/common/createApplicationContext.ts`.

## Exports

| Export                                 | Port                                                                       | Used by the app                                      | Used by the Lambda functions       |
| -------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `createPrismaAuditWriter`              | `audit`                                                                    | the context, `createAuditEvents()`                   | the context, `createAuditEvents()` |
| `createEventBridgeNotificationTrigger` | `notifications`                                                            | `triggerNotifications()`, except `EmailConfirmation` | the context                        |
| `createEventBridgeEmitter`             | none: it sends the events of the trigger and the other events of the hosts | `emitEvents()`                                       | `emitEvents()`, the context        |
| `createEventBridgeClient`              | none: the client of the emitter, with timeouts                             | `emitEvents()`                                       | `emitEvents()`, the context        |

## Rules

- **No host imports.** Never import a module of a host (`apps/…`, `@/…`), `next`, `next/*`, `react`, `react-dom` or `server-only`. The test `src/boundaries.test.ts` fails on such an import. The package can import `@sam-monorepo/application` (for the port types) and `@sam-monorepo/database`.
- **Options from the host.** A factory gets each service and each value from its options, for example the Prisma client, the logger and the ARN of the event bus. The package reads no environment variables.
- **One behavior for all hosts.** When two hosts need a different behavior, the host wraps the implementation. Example: the `emitEvents()` of the Lambda functions logs an `EventBridgeFailedEntriesError` and does not throw it, until the automations become use cases.
