// Entry point for the types, the enums, the namespace and the Prisma error
// helper. Unlike the package root, this
// module must never construct a client or read the environment so it stays
// safe to import from any server module without side effects.
export * from "./generated/prisma/client.js";
export { PrismaErrorCode, isPrismaError } from "./prismaErrors.js";
