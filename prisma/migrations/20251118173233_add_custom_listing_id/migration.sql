/*
  Warnings:

  - A unique constraint covering the columns `[listingId]` on the table `boats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listingId` to the `boats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boats" ADD COLUMN     "listingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "boats_listingId_key" ON "boats"("listingId");
