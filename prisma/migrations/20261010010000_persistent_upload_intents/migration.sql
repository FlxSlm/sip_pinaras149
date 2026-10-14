-- Align the existing default with schema.prisma; existing data is unchanged.
ALTER TABLE "SiteContent" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "UploadIntent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadIntent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UploadIntent_pathname_key" ON "UploadIntent"("pathname");
CREATE INDEX "UploadIntent_ownerId_expiresAt_idx" ON "UploadIntent"("ownerId", "expiresAt");
ALTER TABLE "UploadIntent" ADD CONSTRAINT "UploadIntent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
