import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
export type PrismaClientType = typeof prisma;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";

export {
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
