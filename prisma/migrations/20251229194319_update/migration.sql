-- AlterTable
ALTER TABLE "footer_settings" ALTER COLUMN "copyrightText" SET DEFAULT '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.';

-- CreateTable
CREATE TABLE "why_us" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "excellence" VARCHAR(255),
    "boatsSoldPerYear" VARCHAR(100),
    "listingViewed" VARCHAR(100),
    "buttonText" VARCHAR(100),
    "buttonLink" VARCHAR(500),
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "why_us_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image1Id_key" ON "why_us"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image2Id_key" ON "why_us"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image3Id_key" ON "why_us"("image3Id");

-- CreateIndex
CREATE INDEX "why_us_site_idx" ON "why_us"("site");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_site_key" ON "why_us"("site");

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
