-- CreateEnum
CREATE TYPE "IamSettingKey" AS ENUM ('HUMAN_RESOURCES_ROLE_IDS');

-- CreateTable
CREATE TABLE "IamSetting" (
    "key" "IamSettingKey" NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "IamSetting_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "IamSetting" ADD CONSTRAINT "IamSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
