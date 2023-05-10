const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

async function main() {
  const ownerships = await prisma.fleetOwnership.findMany();

  for (const ownership of ownerships) {
    for (let i = 0; i < ownership.count; i++) {
      await prisma.ship.create({
        data: {
          owner: {
            connect: {
              id: ownership.userId,
            },
          },
          variant: {
            connect: {
              id: ownership.variantId,
            },
          },
        },
      });
    }
  }
}

main()
