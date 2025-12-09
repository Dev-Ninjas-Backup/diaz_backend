/*
  Warnings:

  - You are about to drop the column `logoId` on the `page_banners` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_banners" DROP CONSTRAINT "page_banners_logoId_fkey";

-- AlterTable
ALTER TABLE "ai_search_banners" ALTER COLUMN "site" SET DEFAULT 'JUPITER';

-- AlterTable
ALTER TABLE "page_banners" DROP COLUMN "logoId";
