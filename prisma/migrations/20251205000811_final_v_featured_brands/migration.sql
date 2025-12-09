/*
  Warnings:

  - You are about to drop the column `SiteType` on the `featured_brands` table. All the data in the column will be lost.
  - Added the required column `Site` to the `featured_brands` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Site" AS ENUM ('FLORIDA', 'JUPITER');

-- AlterTable
ALTER TABLE "featured_brands" DROP COLUMN "SiteType",
ADD COLUMN     "Site" "Site" NOT NULL;
