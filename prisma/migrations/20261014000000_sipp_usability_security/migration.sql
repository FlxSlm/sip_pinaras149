-- Additive changes; existing complaints and announcement media remain intact.
BEGIN;
ALTER TABLE "Complaint" ADD COLUMN "neighborhood" SMALLINT;
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_neighborhood_check" CHECK ("neighborhood" IS NULL OR "neighborhood" BETWEEN 1 AND 8);

CREATE TABLE "AnnouncementAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mediaType" "AnnouncementMediaType" NOT NULL,
    "mediaRef" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AnnouncementAttachment_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE,
    CONSTRAINT "AnnouncementAttachment_mediaType_check" CHECK ("mediaType" IN ('PDF', 'VIDEO'))
);
CREATE INDEX "AnnouncementAttachment_announcementId_sortOrder_idx" ON "AnnouncementAttachment"("announcementId", "sortOrder");

CREATE TABLE "AdminLoginThrottle" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    CONSTRAINT "AdminLoginThrottle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Preserve the account ID, role, password, email and all related records.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "User" WHERE "username" = 'admin.pinaras' AND "role" = 'ADMIN_KELURAHAN')
       AND EXISTS (SELECT 1 FROM "User" WHERE "username" = 'kkt149unsrat@pinaras.com') THEN
        RAISE EXCEPTION 'Admin username collision; no account is merged or removed';
    END IF;
END $$;
UPDATE "User" SET "username" = 'kkt149unsrat@pinaras.com'
WHERE "username" = 'admin.pinaras' AND "role" = 'ADMIN_KELURAHAN';
COMMIT;
