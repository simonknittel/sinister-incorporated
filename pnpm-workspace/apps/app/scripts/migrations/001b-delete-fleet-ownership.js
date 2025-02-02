// @ts-check

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

async function main() {
  await prisma.fleetOwnership.deleteMany();
}

main();
