// @ts-check

/**
 * ```bashrc
 * pscale connect db development
 * node 002-permission-value-to-string.js
 * ```
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

async function main() {
  await prisma.permission.updateMany({
    data: {
     value: "true"
   }
 })
}

main()
