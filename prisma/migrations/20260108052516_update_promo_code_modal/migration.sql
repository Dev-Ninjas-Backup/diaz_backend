/*
  Warnings:

  - You are about to drop the column `freeMonths` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `promo_codes` table. All the data in the column will be lost.
  - Made the column `discount` on table `promo_codes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "promo_codes" DROP CONSTRAINT "promo_codes_planId_fkey";

-- AlterTable
ALTER TABLE "promo_codes" DROP COLUMN "freeMonths",
DROP COLUMN "planId",
ADD COLUMN     "freeDays" INTEGER NOT NULL DEFAULT 30,
ALTER COLUMN "stripeCouponId" DROP NOT NULL,
ALTER COLUMN "discount" SET NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 100;
