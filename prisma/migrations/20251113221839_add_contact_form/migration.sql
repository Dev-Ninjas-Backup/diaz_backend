-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('FLORIDA', 'JUPITER');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INDIVIDUAL_LISTING', 'GLOBAL');

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" "ContactSource" NOT NULL,
    "type" "ContactType" NOT NULL,
    "listingId" TEXT,
    "listingSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);
