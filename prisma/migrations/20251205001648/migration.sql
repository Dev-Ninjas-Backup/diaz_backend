/*
  Warnings:

  - You are about to drop the column `Site` on the `featured_brands` table. All the data in the column will be lost.
  - Added the required column `site` to the `featured_brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "featured_brands" DROP COLUMN "Site",
ADD COLUMN     "site" "SiteType" NOT NULL;

-- DropEnum
DROP TYPE "Site";
