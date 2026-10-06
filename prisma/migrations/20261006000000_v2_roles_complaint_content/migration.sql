-- V2 migration: 2 roles + complaint status/priority + CMS + announcement status

-- 1. New enum types
CREATE TYPE "UserRole_new" AS ENUM ('WARGA', 'ADMIN_KELURAHAN');
CREATE TYPE "ComplaintStatus" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');
CREATE TYPE "ComplaintPriority" AS ENUM ('NORMAL', 'PERLU_PERHATIAN');
CREATE TYPE "ComplaintAction_new" AS ENUM ('CREATED', 'OPENED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'RESPONSE_ADDED', 'NOTE_ADDED');
CREATE TYPE "AnnouncementMediaType" AS ENUM ('TEXT', 'PDF', 'VIDEO');
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- 2. Reassign announcements created by kepala_lingkungan to the lurah (admin) before deleting them
UPDATE "Announcement"
SET "createdById" = (SELECT id FROM "User" WHERE role = 'lurah' ORDER BY "createdAt" LIMIT 1)
WHERE "createdById" IN (SELECT id FROM "User" WHERE role = 'kepala_lingkungan');

-- 3. Preserve legacy single-file evidence into ComplaintEvidence
INSERT INTO "ComplaintEvidence" ("id", "complaintId", "path", "mimeType", "sizeBytes", "createdAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    id,
    "evidencePath",
    CASE
        WHEN "evidencePath" ILIKE '%.jpg' THEN 'image/jpeg'
        WHEN "evidencePath" ILIKE '%.webp' THEN 'image/webp'
        ELSE 'image/png'
    END,
    0,
    now()
FROM "Complaint"
WHERE "evidencePath" IS NOT NULL;

-- 4. Delete kepala_lingkungan accounts (their complaint logs -> actor NULL, notifications -> cascade)
DELETE FROM "User" WHERE role = 'kepala_lingkungan';

-- 5. Rename lurah account to a neutral admin identifier
UPDATE "User" SET username = 'admin.pinaras', name = 'Admin Kelurahan Pinaras' WHERE username = 'lurah.pinaras';

-- 6. Migrate User.role to new enum
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
    CASE "role"::text
        WHEN 'warga' THEN 'WARGA'
        WHEN 'lurah' THEN 'ADMIN_KELURAHAN'
        ELSE 'WARGA'
    END::"UserRole_new"
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'WARGA';

-- 7. Drop legacy User fields
ALTER TABLE "User" DROP CONSTRAINT "User_lingkunganId_fkey";
ALTER TABLE "User" DROP COLUMN "lingkunganId";
ALTER TABLE "User" DROP COLUMN "phone";
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;

-- 8. Migrate Complaint status column
ALTER TABLE "Complaint" ALTER COLUMN "handlingStatus" DROP DEFAULT;
ALTER TABLE "Complaint" RENAME COLUMN "handlingStatus" TO "status";
ALTER TABLE "Complaint" ALTER COLUMN "status" TYPE "ComplaintStatus" USING (
    CASE "status"::text
        WHEN 'DIAJUKAN' THEN 'MENUNGGU'
        WHEN 'DIVERIFIKASI' THEN 'MENUNGGU'
        WHEN 'DITERUSKAN_KE_LURAH' THEN 'MENUNGGU'
        WHEN 'DALAM_PROSES' THEN 'DIPROSES'
        WHEN 'SELESAI' THEN 'SELESAI'
        WHEN 'DI_LUAR_KEWENANGAN' THEN 'DITOLAK'
        ELSE 'MENUNGGU'
    END::"ComplaintStatus"
);
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'MENUNGGU';
DROP INDEX "Complaint_handlingStatus_idx";
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- 9. Drop legacy Complaint fields, add V2 fields
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_rating_check";
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_lingkunganId_fkey";
ALTER TABLE "Complaint" DROP COLUMN "rating";
ALTER TABLE "Complaint" DROP COLUMN "ratedAt";
ALTER TABLE "Complaint" DROP COLUMN "publicationStatus";
ALTER TABLE "Complaint" DROP COLUMN "publishedAt";
ALTER TABLE "Complaint" DROP COLUMN "evidencePath";
ALTER TABLE "Complaint" DROP COLUMN "lingkunganId";
ALTER TABLE "Complaint" ADD COLUMN "location" TEXT;
ALTER TABLE "Complaint" ADD COLUMN "priority" "ComplaintPriority";
ALTER TABLE "Complaint" ADD COLUMN "openedAt" TIMESTAMP(3);
ALTER TABLE "Complaint" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "Complaint" ADD COLUMN "rejectedAt" TIMESTAMP(3);
CREATE INDEX "Complaint_priority_idx" ON "Complaint"("priority");

-- 10. Migrate ComplaintLog status columns and action enum
ALTER TABLE "ComplaintLog" ALTER COLUMN "fromStatus" TYPE "ComplaintStatus" USING (
    CASE "fromStatus"::text
        WHEN 'DIAJUKAN' THEN 'MENUNGGU'
        WHEN 'DIVERIFIKASI' THEN 'MENUNGGU'
        WHEN 'DITERUSKAN_KE_LURAH' THEN 'MENUNGGU'
        WHEN 'DALAM_PROSES' THEN 'DIPROSES'
        WHEN 'SELESAI' THEN 'SELESAI'
        WHEN 'DI_LUAR_KEWENANGAN' THEN 'DITOLAK'
    END::"ComplaintStatus"
);
ALTER TABLE "ComplaintLog" ALTER COLUMN "toStatus" TYPE "ComplaintStatus" USING (
    CASE "toStatus"::text
        WHEN 'DIAJUKAN' THEN 'MENUNGGU'
        WHEN 'DIVERIFIKASI' THEN 'MENUNGGU'
        WHEN 'DITERUSKAN_KE_LURAH' THEN 'MENUNGGU'
        WHEN 'DALAM_PROSES' THEN 'DIPROSES'
        WHEN 'SELESAI' THEN 'SELESAI'
        WHEN 'DI_LUAR_KEWENANGAN' THEN 'DITOLAK'
    END::"ComplaintStatus"
);
ALTER TABLE "ComplaintLog" ALTER COLUMN "action" TYPE "ComplaintAction_new" USING (
    CASE "action"::text
        WHEN 'CREATED' THEN 'CREATED'
        WHEN 'VERIFIED' THEN 'NOTE_ADDED'
        WHEN 'INTERNAL_NOTE_ADDED' THEN 'NOTE_ADDED'
        WHEN 'RESPONSE_ADDED' THEN 'RESPONSE_ADDED'
        WHEN 'STATUS_CHANGED' THEN 'STATUS_CHANGED'
        ELSE 'STATUS_CHANGED'
    END::"ComplaintAction_new"
);
ALTER TABLE "ComplaintLog" ADD COLUMN "oldPriority" "ComplaintPriority";
ALTER TABLE "ComplaintLog" ADD COLUMN "newPriority" "ComplaintPriority";

-- 11. Migrate Announcement to status/media enums
ALTER TABLE "Announcement" ADD COLUMN "mediaType" "AnnouncementMediaType" NOT NULL DEFAULT 'TEXT';
ALTER TABLE "Announcement" ADD COLUMN "mediaRef" TEXT;
ALTER TABLE "Announcement" ADD COLUMN "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Announcement" ADD COLUMN "publishedAt" TIMESTAMP(3);
UPDATE "Announcement" SET "status" = (CASE WHEN "published" THEN 'PUBLISHED' ELSE 'DRAFT' END)::"AnnouncementStatus";
ALTER TABLE "Announcement" DROP COLUMN "published";
ALTER TABLE "Announcement" DROP COLUMN "pdfPath";
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- 12. CMS tables
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "source" TEXT NOT NULL,
    "sourceYear" TEXT,
    "sourcePage" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Potential" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sourceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Potential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "imageRef" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sourceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GalleryMedia" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "caption" TEXT,
    "credit" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryMedia_pkey" PRIMARY KEY ("id")
);

-- 13. Drop legacy enum types
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "ComplaintAction";
ALTER TYPE "ComplaintAction_new" RENAME TO "ComplaintAction";
DROP TYPE "HandlingStatus";
DROP TYPE "PublicationStatus";
