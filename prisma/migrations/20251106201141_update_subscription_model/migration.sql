/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `user_subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeSubscriptionId` to the `user_subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BoatListingStatus" AS ENUM ('ONBOARDING_PENDING', 'DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "boats" ADD COLUMN     "status" "BoatListingStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key" ON "user_subscriptions"("stripeSubscriptionId");
