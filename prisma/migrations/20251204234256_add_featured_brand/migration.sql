-- CreateEnum
CREATE TYPE "siteName" AS ENUM ('FLORIDA', 'JUPITER');

-- CreateTable
CREATE TABLE "featured_brands" (
    "id" TEXT NOT NULL,
    "featuredbrandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_brands_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "featured_brands" ADD CONSTRAINT "featured_brands_featuredbrandId_fkey" FOREIGN KEY ("featuredbrandId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
