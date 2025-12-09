/*
  Warnings:

  - Added the required column `bannerTitle` to the `ai_search_banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_search_banners" ADD COLUMN     "bannerTitle" TEXT NOT NULL,
ADD COLUMN     "subtitle" TEXT;
