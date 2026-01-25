/*
  Warnings:

  - You are about to drop the column `discount` on the `promo_codes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[site]` on the table `ai_search_banners` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "promo_codes" DROP COLUMN "discount";

-- CreateIndex
CREATE UNIQUE INDEX "ai_search_banners_site_key" ON "ai_search_banners"("site");
