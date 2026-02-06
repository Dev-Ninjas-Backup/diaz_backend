/*
  Warnings:

  - A unique constraint covering the columns `[boatId,site]` on the table `featured_yachts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "featured_yachts_site_key";

-- CreateIndex
CREATE UNIQUE INDEX "featured_yachts_boatId_site_key" ON "featured_yachts"("boatId", "site");
