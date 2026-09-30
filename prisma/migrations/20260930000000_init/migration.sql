-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('warga', 'kepala_lingkungan', 'lurah');

-- CreateEnum
CREATE TYPE "HandlingStatus" AS ENUM ('DIAJUKAN', 'DIVERIFIKASI', 'DITERUSKAN_KE_LURAH', 'DALAM_PROSES', 'SELESAI', 'DI_LUAR_KEWENANGAN');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ComplaintAction" AS ENUM ('CREATED', 'VERIFIED', 'FORWARDED_TO_LURAH', 'STATUS_CHANGED', 'RESPONSE_ADDED', 'PUBLISHED', 'UNPUBLISHED', 'RATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'warga',
    "lingkunganId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lingkungan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lingkungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "lingkunganId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidencePath" TEXT,
    "handlingStatus" "HandlingStatus" NOT NULL DEFAULT 'DIAJUKAN',
    "internalNote" TEXT,
    "officialResponse" TEXT,
    "respondedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "ratedAt" TIMESTAMP(3),
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintLog" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" "ComplaintAction" NOT NULL,
    "fromStatus" "HandlingStatus",
    "toStatus" "HandlingStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplaintLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pdfPath" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "TicketSequence" (
    "periodKey" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TicketSequence_pkey" PRIMARY KEY ("periodKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_lingkunganId_idx" ON "User"("lingkunganId");
CREATE UNIQUE INDEX "Lingkungan_code_key" ON "Lingkungan"("code");
CREATE UNIQUE INDEX "Complaint_ticketNumber_key" ON "Complaint"("ticketNumber");
CREATE INDEX "Complaint_reporterUserId_idx" ON "Complaint"("reporterUserId");
CREATE INDEX "Complaint_lingkunganId_idx" ON "Complaint"("lingkunganId");
CREATE INDEX "Complaint_handlingStatus_idx" ON "Complaint"("handlingStatus");
CREATE INDEX "Complaint_publicationStatus_idx" ON "Complaint"("publicationStatus");
CREATE INDEX "Complaint_createdAt_idx" ON "Complaint"("createdAt");
CREATE INDEX "ComplaintLog_complaintId_idx" ON "ComplaintLog"("complaintId");
CREATE INDEX "ComplaintLog_actorUserId_idx" ON "ComplaintLog"("actorUserId");
CREATE INDEX "ComplaintLog_createdAt_idx" ON "ComplaintLog"("createdAt");
CREATE UNIQUE INDEX "Announcement_slug_key" ON "Announcement"("slug");
CREATE INDEX "Announcement_published_idx" ON "Announcement"("published");
CREATE INDEX "Announcement_createdById_idx" ON "Announcement"("createdById");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lingkunganId_fkey" FOREIGN KEY ("lingkunganId") REFERENCES "Lingkungan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_lingkunganId_fkey" FOREIGN KEY ("lingkunganId") REFERENCES "Lingkungan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ComplaintLog" ADD CONSTRAINT "ComplaintLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplaintLog" ADD CONSTRAINT "ComplaintLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_rating_check" CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5));
