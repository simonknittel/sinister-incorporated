-- AlterTable
ALTER TABLE "Citizen" ADD COLUMN "welcomedAt" TIMESTAMPTZ(3);

-- Every citizen who had a login before the welcome existed counts as
-- welcomed, so that only members who gain access later get the welcome.
UPDATE "Citizen" SET "welcomedAt" = "createdAt" WHERE "userId" IS NOT NULL;
