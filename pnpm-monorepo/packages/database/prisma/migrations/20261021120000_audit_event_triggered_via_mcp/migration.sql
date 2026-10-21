-- AlterTable
ALTER TABLE "AuditEvent" ADD COLUMN "triggeredViaMcp" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AuditEvent_triggeredViaMcp_createdAt_id_idx" ON "AuditEvent"("triggeredViaMcp", "createdAt", "id");
