-- User.customImage is already part of schema.prisma and the generated client.
-- Add the missing nullable column; existing users and credentials remain intact.
ALTER TABLE "User" ADD COLUMN "customImage" TEXT;
