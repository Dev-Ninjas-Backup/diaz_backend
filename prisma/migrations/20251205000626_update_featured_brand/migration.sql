/*
  Warnings:

  - Added the required column `SiteType` to the `featured_brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "featured_brands" ADD COLUMN     "SiteType" "SiteType" NOT NULL;
